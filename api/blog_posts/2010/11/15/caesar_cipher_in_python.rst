Caesar Cipher in Python
=======================
:category: none
:tags: python, interviews
:date: 2010-11-15

I'm currently teaching my wife to code and one of the problems that we worked on to teach her some fundamental programming concepts was re-implementing the caesar cipher in python. It was fun not only to code but to also start sending each other "secret" messages!

The caesar cipher is a rather simple encoding, you just shift the alphabet a certain amount of characters. For example, if you are using a shift of 2:

.. sourcecode:: ruby

    a => c
    b => d
    y => a
    z => b

Using this as an interview type question would provide a few interesting problems and give you a good perspective on how good a developers problem solving skills are and how knowledgeable they are in the language of their choice.

The first issue is to handle the beginning and end of the alphabet, if you are encoding 'z' then you will have to start your shift on a. The second problem is to only encode letters since there was no ascii table to define in what order characters are shifted back in those times.

Without using too much of the built in python niceties you could do something similar to this:

.. sourcecode:: python

    #!/usr/bin/python
    def decode_shift_letter(current_ord, start, end, shift):
        if current_ord - shift < start:
            new_ord = (current_ord + 26) - shift
            return chr(new_ord)
        else:
            return chr(current_ord-shift)
        
    def encode_shift_letter(current_ord, start, end, shift):
        if current_ord + shift > end:
            new_ord = (current_ord - 26) + shift
            return chr(new_ord)
        else:
            return chr(current_ord+shift)
    
    def decode(input, shift):
        return modify_input(input, shift, decode_shift_letter)
    
    def encode(input, shift):
        return modify_input(input, shift, encode_shift_letter)
    
    def modify_input(input, shift, shift_letter):
        new_sentence = ''
    
        for letter in input:
            # we only encode letters, random characters like +!%$ are not encoded.
            # Lower and Capital letters are not stored near each other on the 
            # ascii table
            lower_start = ord('a')
            lower_end = ord('z')
            upper_start = ord('A')
            upper_end = ord('Z')
            current_ord = ord(letter)
    
            if current_ord >= lower_start and current_ord <= lower_end:
                new_sentence += shift_letter(current_ord, lower_start, lower_end, shift)
            elif current_ord >= upper_start and current_ord <= upper_end:
                new_sentence += shift_letter(current_ord, upper_start, upper_end, shift)
            else:
                new_sentence += letter
    
        return new_sentence
    
    
    def get_shift():
        try:
            shift = int(raw_input('What shift would you like to use?\n'))
        except ValueError:
            print 'Shift must be a number'
            shift = get_shift()
    
        if not (shift > 0 and shift <= 25):
            print 'Shift must be between 1 and 25'
            shift = get_shift()
    
        return shift
    
    def main():
        try:
            task = int(raw_input('1) Encode \n'+ \
                                 '2) Decode \n'))
        except ValueError:
            print 'Invalid task, try again!'
            main()
    
        shift = get_shift()
        input = raw_input('What message would you like to %s\n' % ('Encode' if task == 1 else 'Decode'))
    
        if task == 1:
            print encode(input, shift)
        elif task == 2:
            print decode(input, shift)
    
    if __name__ == '__main__':
        main()

This would prove that you are a decent problem solver and have enough of the language to get things done but if you want to prove you have mastered the python language you might take advantage of some slicing and some methods out of the string module and change your code to look something like:


.. sourcecode:: python

    from string import letters, maketrans
    
    def decode(input, shift):
        return modify_input(input, -shift)
    
    def encode(input, shift):
        return modify_input(input, shift)
    
    def modify_input(input, shift):
        trans = maketrans(letters, letters[shift:] + letters[:shift])
        return input.translate(trans)

Do get more information on string.letters and string.maketrans you can visit their documentation [here](http://docs.python.org/library/string.html)

