
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

read("Courses['Beginner']",     "data/beginner.tsv")
read("Courses['Misc01']",       "data/misc01.tsv")
read("Courses['Misc02']",       "data/misc02.tsv")
read("Courses['Misc03']",       "data/misc03.tsv")
read("Courses['Misc04']",       "data/misc04.tsv")
read("Courses['Misc05']",       "data/misc05.tsv")
read("Courses['Queens']",       "data/queens.tsv")
read("Courses['Bishops']",      "data/bishops.tsv")
read("Courses['Rooks']",        "data/rooks.tsv")
read("Courses['Knights']",      "data/knights.tsv")
read("Courses['Pawns']",        "data/pawns.tsv")
read("Courses['Intermediate']", "data/intermediate.tsv")

w.close()