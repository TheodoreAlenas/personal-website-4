from sys import argv

l = None
with open(argv[1], 'r') as f:
    l = ''.join(f)

p = l.find("<body>")
print(l[:p])
markup = ''
on_markup = False
for c in l[p:]:
    if c == '<':
        on_markup = True
    if on_markup:
        markup += c
    if c == '>':
        on_markup = False
        print(markup)
        markup = ''

