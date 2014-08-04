Preparing custom images for OpenStack
========================================
This article will show you how to use libvirt to create base images that can be
uploaded to OpenStack.

Why would you want to do this?
-----------------------------------
Linux distributions like Fedora and Ubuntu already ship "cloud" images and most
providers also have their own custom images for you to use, but I find it much
more comforting to have full control of the software that is installed and I
like the ability to easily apply new security patches to base images.

I wouldn't use images to replace config management (CM) with something like
`Salt <http://www.saltstack.com/>`_  or `Ansible <http://www.ansible.com/>`_
but they are nice to give sane system defaults in things like ``grub.conf``, 
``sysctl.conf``, and shipping a Chef or Salt agent so that your CM engine can 
communicate with your server right away.

Setting up your environment
-----------------------------------
The first thing you need to do is get a minimal install disk for the Linux
distribution you want to use. I prefer using Fedora netinst disks but another
popular option is Ubuntu Server.

To get the latest Fedora here, you can choose "netinst" under Direct Downloads:
http://fedoraproject.org/en/get-fedora-all

To get the latest Ubuntu you can go here:
http://www.ubuntu.com/download/server

Once you have acquired your distribution of choice you just need to verify that
you have ``virt-install`` and ``virt-viewer`` installed:

Fedora:

.. sourcecode:: bash

    yum install virt-install virt-viewer

Ubuntu:

.. sourcecode:: bash

    apt-get install virtinst virt-viewer

If you prefer a graphical user interface, you may use ``virt-manager`` instead, but I try
to keep everything in the CLI; that way it can be repeated easily.


Preparing your disk
-----------------------------------
Now that you have a base ISO and the tools necessary, let's get started by creating
a disk to install the virtual server into. Resizing an image isn't an impossible
task but it is much easier to choose a reasonably sized disk for the purpose it will
be used for.

I primarily use 8 GB disks -- that way we can fit all the system components required
as well as our own web applications. Any large files should be placed in a SAN
or something like Dreamhost's dreamobjects.

The other big decision you must make upfront is what disk format you want to use 
-- the trade-off is disk space vs performance. The two primary formats are
qcow2 (QEMU Copy on Write) and Raw. qcow2 is great if you have limited disk space
and don't want to allocate the full 8 GB up front. Raw is preferred if you want
the best performance.

If you choose qcow2, you'll also need to make sure you have ``qemu-img``:

Fedora:

.. sourcecode:: bash

    yum install qemu-img

Ubuntu:

.. sourcecode:: bash

    apt-get install qemu-utils


Create a raw disk:

.. sourcecode:: bash

    fallocate -l 8192M server.img

Create a qcow2 disk:

.. sourcecode:: bash

    qemu-img create -f qcow2 server.qcow2 8G


Installing your distribution onto the disk
---------------------------------------------
We will use the ``virt-install`` command to get the distribution installed
onto the disk image.

To install Fedora on a qcow2 disk image:

.. sourcecode:: bash

    virt-install --name base_server --ram 1024 --cdrom=./Fedora-20-x86_64-netinst.iso \
    --disk path=./server.qcow2,format=qcow2

To install Ubuntu Server on a raw disk image:

.. sourcecode:: bash

    virt-install --name base_server --ram 1024 --cdrom=./ubuntu-12.04.4-server-amd64.iso \
    --disk path=./server.img,format=raw


You should follow the standard install steps that you normally would when
setting up your distribution. But here are some tips for each:

Fedora:

- Choose minimal install -- by default it selects "GNOME". 

Ubuntu:

- Be sure to select OpenSSH server -- it won't install it by default. 
- On Ubuntu 12.04, there is a bug that makes it hang after running ``fsck``. You
  will need to edit grub to get it to boot, hit _e_ at the boot prompt and
  add "nomodeset" on the linux line. You will know that you need to do this if your
  boot hangs on fsck:

  .. sourcecode:: bash

      fsck from util-linux 2.20.1
      /dev/mapper/ubuntu--vg-root: clean, 57106/441504 files, 286779/1764352 blocks
      /dev/sda1: clean, 230/62248 files, 39833/248832 blocks

Preparing image for openstack
---------------------------------------------
To prepare a virtual machine for the cloud, you will need to install the
``cloud-init`` package, which allows the cloud providers to inject certain system
settings when creating servers based on the image.  These are things like
hostname and ssh keys.

On Fedora:

.. sourcecode:: bash

    yum install cloud-init

On Ubuntu:

.. sourcecode:: bash

    apt-get install cloud-init

Then you need to just configure ``cloud-init`` by editing ``/etc/cloud/cloud.cfg`` and
update the ``datasources_list`` section to include EC2. OpenStack uses EC2 metadata
for ``cloud-init``.

You should also verify the user setting in this same config and define the user
you plan to use, it will be where the ``authorized_keys`` file is setup for when
the cloud provider injects your SSH key into the server.

``cloud-init`` will not create the user for you, it will just assign the SSH keypair
and reset the password. So make sure the user defined in ``cloud.cfg`` is also
created on the system.

Once you have your ``cloud-init`` settings the way you want them, just shutdown and
run the ``virt-sysprep`` command.

On the guest machine:

.. sourcecode:: bash

    shutdown -h now

On the host machine:

.. sourcecode:: bash

    virt-sysprep -d base_server


Uploading your image to OpenStack
---------------------------------------------
Using the glance API it is very straightforward to upload the image to
OpenStack. Just run the following command:

.. sourcecode:: bash

    glance image-create --name base_server --disk-format=qcow2 \
    --container-format=bare --is-public=True --file server.qcow2 --progress

Once the image upload completes you will be able to use it immediately within
nova. You can reference it by name or by the id from `glance image-list`.

To create your first instance from the image:

.. sourcecode:: bash

    nova boot --flavor m1.tiny --image base_server --key-name devops \
    --security-groups free_for_all test_server

Obviously the security groups, key name, and flavors are based on your
installation of OpenStack but can all easily be queried from the nova API:

.. sourcecode:: bash

    nova flavor-list
    nova secgroup-list
    nova keypair-list


Modifying an image
---------------------------------------------
Once you have ran ``virt-sysprep`` on the image, it can no longer be booted without
being provided the ``cloud-init`` metdata, so to edit an existing image you need
to use ``virt-rescue``.

You need to get ``virt-rescue``:

Fedora:

.. sourcode:: bash

    yum install libguestfs-tools

Ubuntu:

.. sourcode:: bash

    apt-get install libguestfs-tools

First, check what the mount points should be:

.. sourcecode:: bash

    $ virt-rescue -a server.qcow2 --suggest

Which should output something similar to this:

.. sourcecode:: bash

    mount /dev/mapper/ubuntu--vg-root /sysroot/
    mount /dev/sda1 /sysroot/boot
    mount --bind /dev /sysroot/dev
    mount --bind /dev/pts /sysroot/dev/pts
    mount --bind /proc /sysroot/proc
    mount --bind /sys /sysroot/sys

Save those commands, you will need them later. Next run the following:

.. sourcecode:: bash

    virt-rescue -a server.qcow2

This brings up a shell that looks like this:

.. sourcode:: bash

    I have no name!@(none):/# 

Run the previous mount commands in that shell and then run:

.. sourcecode:: bash

    chroot /sysroot
    /bin/bash

You now have a working shell in your base image for editing configuration.
This shell does not have networking access or anything so you are limited
on what you can do but if you need to add new users, update ``cloud.cfg``, or
anything like that it is perfect.

You can run the glance-upload immediately after making changes in that shell.

If you need the ability to use the full distribution (for example, the package manager) then you may want to setup a local cloud-init config and boot the image directly. Then re-run sysprep on it.


Booting an image without OpenStack
---------------------------------------------
Sometimes it is useful to test an image locally before spending the time
to upload it to OpenStack.  To do this you need to have the `libguestfs-tools`
and `qemu-kvm` packages installed:

Fedora:

.. sourcode:: bash

    yum install libguestfs-tools qemu-kvm

Ubuntu:

.. sourcode:: bash

    apt-get install libguestfs-tools qemu-kvm


First create a directory "cloudinit":

.. sourcecode:: bash

    mkdir cloudinit

Then place the following two files in it:

meta-data:

.. sourcecode:: bash

    instance-id: iid-mycloud
    local-hostname: testcloud

user-data:

.. sourcecode:: bash

    #cloud-config
    password: temp123!

Note: the `#cloud-config` line is not a comment, it is an actual config
directive.

Create a folder called ??????
You should place both of these files together in a directory and then run the
following command to make a file system that can be mounted in your VM:

.. sourcecode:: bash

    cd cloudinit
    virt-make-fs --type=msdos --label=cidata . cloudinit.img

Now you should be able to boot the image with the cloud-init information using `kvm`:

.. sourcecode:: bash

    kvm -net nic -net user -hda server.qcow2 -hdb cloudinit.img -m 512

This will boot your image, inject the cloud init settings and you will now be able
to login with the user you set in ``/etc/cloud/cloud.cfg`` and the password ``temp123``!

.. author:: default
.. categories:: devops
.. tags:: linux, openstack, libvirt
.. comments::
