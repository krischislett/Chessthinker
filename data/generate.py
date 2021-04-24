
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

read("Courses['beginner']",     "data/beginner.tsv")
read("Courses['misc01']",       "data/misc01.tsv")
read("Courses['misc02']",       "data/misc02.tsv")
read("Courses['misc03']",       "data/misc03.tsv")
read("Courses['misc04']",       "data/misc04.tsv")
read("Courses['misc05']",       "data/misc05.tsv")
read("Courses['queens']",       "data/queens.tsv")
read("Courses['bishops']",      "data/bishops.tsv")
read("Courses['rooks']",        "data/rooks.tsv")
read("Courses['knights']",      "data/knights.tsv")
read("Courses['pawns']",        "data/pawns.tsv")
read("Courses['intermediate']", "data/intermediate.tsv")

w.close()