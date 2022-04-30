---
category: |
    spanish
date: 2022-04-30
tags: |
    pandas
title: How to speak spanish like a 1920s phone operator!
---

I've been living in Puerto Rico for 4 years but two of those have been COVID and so I haven't been able to practice Spanish as much as I'd like. So to speed up my learning I've decided I want to watch a lot of spanish speaking television to start training my ears, but to do this I need a baseline of words I understand to be able to even know what they are saying!

Learning through apps like Duolingo, Drops, etc start with weird topics like vegetables that don't get you to a very good baseline for actually understanding daily conversations, so I think consuming TV is a better use of my time. 

## Subtitles
I've decided the way to understand what the best words to study are is to download every subtitle for every episode of a show I want to watch and then count each word.  The more a word is spoken the more important it is for me to know it since I'll be hearing it a lot in the show.

I'm going to download subtitles from Netflix. Subtitles in Netflix are in WebVTT format, which looks like this:

```
248
00:17:58.285 --> 00:18:01.163  position:50.00%,middle  align:middle size:80.00%  line:79.33% 
Yo de verdad espero que ustedes
me vean como una amiga, ¿mmm?

249
00:18:01.247 --> 00:18:02.539  position:50.00%,middle  align:middle size:80.00%  line:84.67% 
No como una madrastra.

250
00:18:04.250 --> 00:18:06.127  position:50.00%,middle  align:middle size:80.00%  line:84.67% 
Yo nunca te vi como una madrastra.
```

It gives you a start time, end time, and the text on the screen.   So my first process was parsing this format and just turning it into a list of words using https://github.com/glut23/webvtt-py.


### Dummy parsing 
What I basically did was `text.split(" ")` and started counting the words.   This approach was quick and painless but it had a few downs falls.    Some words *look* the same when in reality they are not and so this meant I'd have to study every meaning of a word even if it was more rare.

An example of this is the word "como", you can say:

- Haz como te digo: "Do as I say", where como means "as"
- como tacos todos los dias: "I eat tacos every day", where como is a conjugated form of the verb "to eat"

I need to know which version of a word is being used so I can count it properly.

### Regular Expressions are always the answer
I couldn't figure out what the word was without it being in a complete sentence, but subtitles are fragments.   They are split up into timings for displaying on the screen but they don't include entire sentences.  For example, it might look like this:

```
23
00:01:21.960 --> 00:01:23.520  position:50.00%,middle  align:middle size:80.00%  line:84.67% 
Solo las que luchan por ellos

24
00:01:23.680 --> 00:01:25.680  position:50.00%,middle  align:middle size:80.00%  line:84.67% 
consiguen sus sueños.
```

I want to detect the start of a sentence and the end of a sentence and then combine it, so that you end up with "Solo las que luchan por ellos consiguen sus sueños.".   My first thought was a regular expression on punctuation.   This worked well *most* of the time but there were enough exceptions to the rule that it broke often on generated a lot of broken sentences:

- Abbreviations like "EE. UU" for estados unidos (united states)
- Ellipsis

Splitting on spaces also didn't work for identifying the parts of speech since I needed the context around the word.

<center>
<img src="https://cdn.zappy.app/51b01eb5330df4d7582637acb6bc539a.png" />
</center>

## Natural Language Processing
So to solve my pain I decided to grab https://spacy.io/ and do some NLP on the subtitles so that I could identify the proper parts of speech and get an accurate representation of the words I needed to learn.

The way spaCy works is you can send it a sentence and it'll return you a set of tokens:

```
>>> import spacy
>>> nlp = spacy.load("es_core_news_sm")
>>> [x.pos_ for x in nlp("Hola, como estas?")]
['PROPN', 'PUNCT', 'SCONJ', 'PRON', 'PUNCT']
```

So now I could identify the parts of speech and pull sentences together through end of sentence punctation.   The first thing I did was generate a CSV of sentences that looked like this:

<table>
<tr>
<th>sentence</th>
<th>start</th>
<th>end</th>
<th>show</th>
<th>file</th>
</tr>
<tr>
<td>Si no, le voy a cortar todos los deditos</td>
<td>00:00:20.605</td>
<td>00:00:24.125</td>
<td>El marginal</td>
<td>El marginal S02E02 WEBRip Netflix es[cc].vtt</td>
</tr>
</table>

Once I had a CSV of sentences I could send those back through spaCy for NLP and then start counting words, to generate another CSV:

<table>
<tr>
<th>word</th>
<th>pos</th>
<th>show</th>
<th>file</th>
</tr>
<tr>
<td>a</td>
<td>ADP</td>
<td>El marginal</td>
<td>El marginal S02E02 WEBRip Netflix es[cc].vtt</td>
</tr>
<tr>
<td>cortar</td>
<td>VERB</td>
<td>El marginal</td>
<td>El marginal S02E02 WEBRip Netflix es[cc].vtt</td>
</tr>
<tr>
<td>todos</td>
<td>PRON</td>
<td>El marginal</td>
<td>El marginal S02E02 WEBRip Netflix es[cc].vtt</td>
</tr>
</table>

From there I had all the data I needed!   So now it was time to start doing some data analysis!

## Data analysis
Using a jupyter notebook ( https://jupyter.org/ ) I grabbed pandas ( https://pandas.pydata.org/ ) and read in my CSVs to start analyzing the results.

```
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
pd.set_option('display.max_rows', 1000)
words = pd.read_csv('word_data.csv.gz', compression='gzip', delimiter=',')
```

The words dataframe is built up out of the second table I showed above with just words and their parts of speech.   I started off grouping the dataset by the word so I could get a count for how many times it was spoken in every series I parsed:

```
grouped_result = (words.groupby(words.word).size() 
   .sort_values(ascending=False) 
   .reset_index(name='count')
   .drop_duplicates(subset='word'))

grouped_result.head(300)
```

Which returned a list of words and their count:

```
	word	count
0	que	94430
1	no	75931
2	a	70968
3	de	67982
4	ser	64226
5	la	52143
6	y	44390
7	estar	37819
8	el	35920
```

Now I wanted to identify where my diminishing returns would be.   Is there a set of words that I must learn because they are spoken so often that I wouldn't understand a conversation if they weren't in my vocabulary?

<center>
<img src="https://cdn.zappy.app/d8c6b45084cf94dc1174b0181b00c763.png" />
</center>

As you can see in this chart, the usage for words drops off at around the ~200 mark.   So there are basically 150 words I *must* know and then the rest are equally important.   I wasn't quite happy with this because some parts of speech are higher priority than others, for example I think having a strong understanding of the popular verbs will go a long way.  So I also wanted to identify what are the most important verbs to learn:

```
grouped_verbs = (words[words.pos == 'VERB'].groupby(['word', 'pos']).size() 
   .sort_values(ascending=False) 
   .reset_index(name='count')
   .drop_duplicates(subset='word'))

grouped_verbs.head(50)
```

Which got me this:

```
	word	pos	count
0	tener	VERB	22072
1	hacer	VERB	14946
2	ir	VERB	12570
3	decir	VERB	11314
4	querer	VERB	11083
5	ver	VERB	10269
6	estar	VERB	9780
7	saber	VERB	8704
8	ser	VERB	7674
9	dar	VERB	5722
10	pasar	VERB	5528
11	hablar	VERB	5355
12	venir	VERB	5145
13	creer	VERB	4895
14	salir 	VERB	3395
```

Verbs had a slightly different drop-off pattern when I targeted them directly:

<center>
<img src="https://cdn.zappy.app/bca0b3810fde5627d72bf14a5292375d.png" />
</center>

I get a big bang for my buck by learning those top 40 verbs.   Nouns on the other hand are much more spread out and most are evenly distributed:

```
word	pos	count
0	gracias	NOUN	4676
1	favor	NOUN	4625
2	señor	NOUN	4116
3	verdad	NOUN	3566
4	vida	NOUN	2673
5	hombre	NOUN	2601
6	madre	NOUN	2597
7	vez	NOUN	2537
8	tiempo	NOUN	2492
9	hijo	NOUN	2215
```

<center>
<img src="https://cdn.zappy.app/893b9203256d51c13eaf97f872793de1.png" />
</center>

So then I thought to myself... How much of a show would I understand if I just learned these most important words?  So I started by excluding some of the easy parts of speech and focused on the most important:

```
find_important_words = (words[~words.pos.isin(['PRON', 'CONJ', 'ADP', 'ADV', 'SCONJ', 'AUX', 'INTJ'])].groupby(['word', 'pos']).size() 
   .sort_values(ascending=False) 
   .reset_index(name='count')
   .drop_duplicates(subset='word'))

find_important_words.head(50)
```

The top 20 were all verbs except for `bueno` and `gracias`.   So now with my list of what I considered "important words" I plotted it to find what amount of words I wanted to learn:

<center>
<img src="https://cdn.zappy.app/1aaf2ee52ff49d53d9830ccc1dc02046.png" />
</center>

It looks like 200 learned words would give me a reasonable amount of understanding for a series, so I decided to calculate how much of a series I would understand if I learned just those first 200 words:

```
percentages = {}

for show_name in words['media'].drop_duplicates().values:
    words_in_show = (words[words.media == show_name].groupby(words.word).size() 
       .sort_values(ascending=False) 
       .reset_index(name='count')
       .drop_duplicates(subset='word'))
    
    total_words_handled = 0

    for word in grouped_result['word'][:200]:
        values = words_in_show[words_in_show.word == word]['count'].values

        if values.size > 0:
            total_words_handled += values[0]

    percentages[show_name] = total_words_handled / words_in_show.sum().loc['count']
```

Now I had a table that would show me what percentage of the spoken words were covered by the first 200 words in my list:

```
p_df = pd.DataFrame(percentages.items(), columns=['show', 'percentage'])
p_df = p_df.sort_values(by='percentage')
p_df['percentage'] = p_df['percentage'] * 100
pd.options.display.float_format = '{:,.2f}%'.format
p_df
```

<table>
<tr>
<th>Show</th>
<th>Percentage</th>
</tr>

<tr>
<td>Verónica</td>
<td>64.24%</td>
</tr>

<tr>
<td>El ciudadano ilustre</td>
<td>65.28%</td>
</tr>

<tr>
<td>El Chapo</td>
<td>66.68%</td>
</tr>

<tr>
<td>Neruda</td>
<td>66.89%</td>
</tr>

<tr>
<td>La casa de papel</td>
<td>67.56%</td>
</tr>

<tr>
<td>El Ministerio del Tiempo</td>
<td>68.03%</td>
</tr>


<tr>
<td>Club de Cuervos</td>
<td>68.19%</td>
</tr>


<tr>
<td>El marginal</td>
<td>68.47%</td>
</tr>

<tr>
<td>Ingobernable</td>
<td>68.59%</td>
</tr>

<tr>
<td>Pablo Escobar</td>
<td>70.20%</td>
</tr>

<tr>
<td>Fariña</td>
<td>70.95</td>
</tr>

<tr>
<td>La Reina del Sur</td>
<td>71.52%</td>
</tr>


<tr>
<td>Gran Hotel</td>
<td>73.15%</td>
</tr>

<tr>
<td>Las chicas del cable</td>
<td>73.58%</td>
</tr>


<tr>
<td>Élite</td>
<td>73.78%</td>
</tr>

<tr>
<td>La Piloto</td>
<td>74.03%</td>
</tr>

<tr>
<td>El bar</td>
<td>74.07%</td>
</tr>

<tr>
<td>La casa de las flores</td>
<td>75.40%</td>
</tr>

<tr>
<td>Tarde para la ira</td>
<td>75.59%</td>
</tr>

</table>

But living in Puerto Rico, one thing I've realized is speed of speech is also important.  I have a much easier time speaking with people from Colombia and Mexico than I do with Puerto Ricans because they speak so much faster.   So even though I could understand 75% of "Tarde para la ira" if I learned the 200 words, I want to make sure they are speaking at a pace I could understand as well.

So I loaded up the other CSV file that was the full sentences and added a "time per word" column:

```
sentences = pd.read_csv('sentences.csv.gz', compression='gzip', delimiter=',', parse_dates=['start', 'end'])
sentences['total_time'] = (sentences['end'] - sentences['start']).dt.total_seconds()
sentences['word_count'] = sentences['sentence'].str.split().str.len()
sentences['time_per_word'] = sentences['total_time'] / sentences['word_count']
```

Then I was able to have a speed rating for each show:

```
sentence_group = sentences.groupby([sentences.media])
sentence_group.time_per_word.mean().reset_index().sort_values('time_per_word')
```

<table>
<tr>
<th>media</th>
<th>time_per_word</th>
</tr>

<tr>
<td>Gran Hotel</td>
<td>0.58</td>
</tr>

<tr>
<td>El Chapo</td>
<td>0.59</td>
</tr>

<tr>
<td>Las chicas del cable</td>
<td>0.61</td>
</tr>

<tr>
<td>Élite</td>
<td>0.63</td>
</tr>

<tr>
<td>Ingobernable</td>
<td>0.64</td>
</tr>

<tr>
<td>El Ministerio del Tiempo</td>
<td>0.64</td>
</tr>

<tr>
<td>Fariña</td>
<td>0.65</td>
</tr>

<tr>
<td>El ciudadano ilustre</td>
<td>0.67</td>
</tr>

<tr>
<td>Neruda</td>
<td>0.68</td>
</tr>

<tr>
<td>La Piloto</td>
<td>0.69</td>
</tr>

<tr>
<td>La casa de papel</td>
<td>0.70</td>
</tr>

<tr>
<td>El bar</td>
<td>0.70</td>
</tr>

<tr>
<td>Verónica</td>
<td>0.72</td>
</tr>

<tr>
<td>La Reina del Sur</td>
<td>0.75</td>
</tr>

<tr>
<td>Club de Cuervos</td>
<td>0.76</td>
</tr>

<tr>
<td>El marginal</td>
<td>0.76</td>
</tr>

<tr>
<td>Pablo Escobar</td>
<td>0.77</td>
</tr>

<tr>
<td>Tarde para la ira</td>
<td>0.77</td>
</tr>

<tr>
<td>La casa de las flores</td>
<td>0.81</td>
</tr>

</table>

Luckily the two series that have the least amount of vocabulary also speak the slowest!   So these will be the series I start with.    The final question I wanted to answer is "What are the top words I'm missing for a series".    Since I'll know 75% of the series from the top 200 words, I'm hoping there are some top words from a specific series that I can also learn to get an even higher understanding.

First, find which words are in each show but not in the top 200:

```
missing_words_by_show = {}

for show_name in words['media'].drop_duplicates().values:
    words_in_show = (words[words.media == show_name].groupby(words.word).size() 
       .sort_values(ascending=False) 
       .reset_index(name='count')
       .drop_duplicates(subset='word'))
    
    frequency_words = grouped_result['word'][:200]

    missing_words = words_in_show[~words_in_show.word.isin(frequency_words.values)]
    missing_words_by_show[show_name] = missing_words
```

Then we were able to grab them per show:

```
missing_words_by_show['La casa de las flores'].head(50)

word	count
31	mamá	252
70	florería	87
98	perdón	56
102	sea	54
116	además	44
126	ahorita	40
132	cárcel	38
133	fiesta	38
```

So adding those few words to my vocabulary will also give me a better understanding of the series.

## Conclusion
I believe a data-driven approach to language learning will be an effective way to get me speaking better spanish.   It was a ton of fun to play with spaCy, pandas, and jupyter as well!

I'll improve the data analysis over time as well but I do believe this is a pretty good starting point!

<center>
<img src="https://cdn.zappy.app/54a9b682b4f87512ab9a471321b1da6c.png" />
</center>