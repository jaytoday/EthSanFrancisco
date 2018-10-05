$(function(){
    let privateKey;
    function selectUsersFromPassword(password, count) {
        return new Promise(function (resolve, reject) {
            resolve([0, 1, 2, 3, 4]);
        });
    }

    var SAMPLE_PASSWORD = 'hello123';
    var SAMPLE_USERNAME = 'username';
    console.log("document ready");
    var submit_new_seedphrase = $('#submit-new-seedphrase');
    var get_seedphrase = $('#get-seedphrase');
    // console.log(input_new_seedphrase);

    // Send Seed Phrase
    submit_new_seedphrase.click(function(e){
        e.preventDefault();
        var input_new_seedphrase = $('#seedphrase').val();
        const socket = io('http://192.168.0.60:3000');
        socket.on('connect', function () {
            console.log("Connected for Splitting IO");
            socket.emit('get user count');
            socket.on('user count', function (count) {
                selectUsersFromPassword(SAMPLE_PASSWORD, count)
                    .then(function (arrayWithIndices) {
                        // console.log("array of indices", arrayWithIndices);
                        function afterLoop(array){
                            window.App.Send(array, input_new_seedphrase, SAMPLE_PASSWORD, SAMPLE_USERNAME)
                                .then(function (arrayReturn) {
                                    console.log(arrayReturn);
                                    socket.emit('send shards', array);
                                });
                        }
                        let arrayOfData = [];
                        let i = 0;
                        requestForData(arrayWithIndices[i]);
                        socket.on('user data', function (data) {
                            // console.log("Data : ", data);
                            arrayOfData.push(data);
                            i++;
                            if(i < arrayWithIndices.length){
                                requestForData(arrayWithIndices[i]);
                            }else{
                                afterLoop(arrayOfData);
                            }
                        })
                    });
            });
            function requestForData(index) {
                socket.emit('get user data', index);
            }
        });
    });
    // End Send Seed Phrase

    // Receive Seed Phrase
    get_seedphrase.click(function (e) {
        e.preventDefault();
        const socket = io('http://192.168.0.60:3000');
        const keyPair = window.App.Generate();
        privateKey = keyPair.privateKey;
        const publicKey = keyPair.publicKey;
        socket.on('connect', function () {
            socket.emit('get user count');
            socket.on('user count', function (count) {
                selectUsersFromPassword(SAMPLE_PASSWORD, count)
                    .then(function (arrayWithIndices) {
                        function afterLoop(array){
                            window.App.Request(array, publicKey, SAMPLE_PASSWORD, SAMPLE_USERNAME)
                                .then(function (arrayReturn) {
                                    socket.emit('request shards', arrayReturn);
                                })
                        }
                        let arrayOfData = [];
                        let i = 0;
                        requestForData(arrayWithIndices[i]);
                        socket.on('user data', function (data) {
                            // console.log("Data : ", data);
                            arrayOfData.push(data);
                            i++;
                            if(i < arrayWithIndices.length){
                                requestForData(arrayWithIndices[i]);
                            }else{
                                afterLoop(arrayOfData);
                            }
                        })
                    });
            });
            function requestForData(index) {
                socket.emit('get user data', index);
            }
        });

        function receivingShards() {
            socket.on('shards', function (shards) {

            });
        }
    })
    //End Receive Seed Phrase
});