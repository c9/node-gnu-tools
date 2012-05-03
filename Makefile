install: bin/find bin/grep

clean:
	cd findutils-src && make distclean
	cd grep-src && make distclean

bin:
	mkdir bin

pcre:
	cd pcre-src && ./configure && make && make install

bin/find: bin 
	cd findutils-src && ./configure && make
	cp findutils-src/find/find bin/find

bin/grep: bin
	cd grep-src && ./configure && make
	cp grep-src/src/grep bin/grep
	
publish: clean
	npm publish