Modifying cloud images with libvirt
===================================
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
.. categories:: none
.. tags:: none
.. comments::
