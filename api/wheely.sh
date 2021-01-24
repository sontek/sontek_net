# This is a simple bash script to make manylinux
# wheels.
for file in wheelhouse/*.whl
do
  auditwheel repair $file
  if [ $? -eq 0 ]
  then
    echo "Made new wheel: $file, deleting bad done"
    rm $file
  fi
done
