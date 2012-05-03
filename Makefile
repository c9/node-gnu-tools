install: bin/find bin/grep

bin:
	mkdir bin

bin/find: bin 
	cd findutils-src && ./configure && make
	cp findutils-src/find/find bin/find

bin/grep: bin
	cd grep-src && ./configure && make
	cp grep-src/src/grep bin/grep
