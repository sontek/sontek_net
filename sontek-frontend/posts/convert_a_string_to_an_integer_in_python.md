---
category: |
    python
date: 2010-10-28
tags: |
    python, interviews
title: Convert a string to an integer in Python
---

A fun interview question some developers like to ask is to have you
convert ascii characters to an integer without using built in methods
like string.atoi or int().

So using python the obvious ways to convert a string to an integer are
these:

```python
>>> int('1234')
1234
>>> import string
>>> string.atoi('1234')
1234
```

The interesting thing here is finding out where on the ascii character
table the number is. Luckily python has this already built in with the
ord method:

```python
>>> help(ord)

ord(...)
    ord(c) -> integer

    Return the integer ordinal of a one-character string.

>>> ord('1')
49
>>> ord('2')
50
```

You can see that the numbers are grouped together on the ascii table, so
you just have to grab \'0\' as the base and subtract the rest:

```python
>>> ord('1')-ord('0')
1
```

So if we have the string \'1234\', we can get each of the individual
numbers by looping over it:

```python
>>> num_string = '1234'
>>> num_list = []
>>> base = ord('0')
>>> for num in num_string:
...   num_list.append(ord(num) - base)
...
>>> print num_list
[1, 2, 3, 4]
```

but now how to we combine all these together to get 1234? You can\'t
just add them up because you\'ll just get 1+2+3+4 = 10.

So, we have to get 1000 + 200 + 30 + 4, which is a simple problem to
solve. Its just number times 10 to the nth power, so the final solution
is:

```python
num = '1234'
new_num = 0
base = ord('0')

for i,n in enumerate(reversed(num)):
      new_num += (ord(n) - base) * (10**i)

print new_num
```

This code is a little verbose though, lets make it a dirty nasty one
liner!

```python
>>> sum([(ord(n)-ord('0')) * (10 ** i) for i,n in enumerate(reversed('1234'))])
1234
```
