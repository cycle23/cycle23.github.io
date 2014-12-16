# using google's closure compiler  ~ 2014-12-01

java -jar ../../../closure/compiler.jar  --language_in=ECMASCRIPT6 --language_out=ES5 --js_output_file=test.min.js test.js
java -jar ../../../closure/compiler.jar  --language_in=ECMASCRIPT6 --language_out=ES5 --js_output_file=test.audio.min.js test.audio.js
java -jar ../../../closure/compiler.jar  --language_in=ECMASCRIPT6 --language_out=ES5 --js_output_file=donkey.min.js donkey.js
java -jar ../../../closure/compiler.jar  --language_in=ECMASCRIPT6 --language_out=ES5 --js_output_file=donkey.audio.min.js donkey.audio.js
java -jar ../../../closure/compiler.jar  --language_in=ECMASCRIPT6 --language_out=ES5 --js_output_file=jquery.mb.audio2.min.js jquery.mb.audio.js
