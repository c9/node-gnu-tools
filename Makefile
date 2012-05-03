install: bin/find bin/grep

clean:
	rm -rf grep*
	rm -rf find*
	rm -rf pcre*

bin:
	mkdir bin

findutils-4.4.2.tar.gz:
	curl -LO http://ftpmirror.gnu.org/findutils/findutils-4.4.2.tar.gz

bin/find: bin findutils-4.4.2.tar.gz
	tar xvfz findutils-4.4.2.tar.gz
	cd findutils-4.4.2 && ./configure && make
	cp findutils-4.4.2/find/find bin/find

grep-2.9.tar.gz:
	curl -LO http://ftpmirror.gnu.org/grep/grep-2.9.tar.gz

bin/grep: bin grep-2.9.tar.gz
	tar xvfz grep-2.9.tar.gz
	cd grep-2.9 && ./configure && make
	cp grep-2.9/src/grep bin/grep

pcre-8.30.tar.gz:
	curl -LO ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.30.tar.gz

makepcre:
	tar xvfz pcre-8.30.tar.gz
	cd pcre-8.30 && ./configure && make && make install