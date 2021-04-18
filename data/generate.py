
w = open("js/data.js", "w")
w.write("Courses = {};\n\n")

def read(name, file):
    with open(file) as r:
        w.write(name + " = [\n")
        for line in r:
            toks = line.strip().split(" ")
            fen  = (" ").join(toks[1:len(toks)])
            w.write("{ 'id':" + str(toks[0]) + ", 'fen':'" + fen + "' },\n")
        w.write("];\n\n")

read("Courses['beginner']", "data/beginner.tsv")
read("Courses['intermediate']", "data/intermediate.tsv")

w.close()