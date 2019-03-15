
$(document).ready(() =>{
    $('#currRatingsBtn').click(() =>{
        console.log("btn curr ratings")
        $.get({
            url:'http://localhost:3000/',
            dataType:'jsonp',
            success: (data) =>{
                console.log('ajac table success!!!');
            }
        });
    });

    $('#allPlayersBtn').click(() =>{
        console.log("btn all players")
        $.get({
            url:'http://localhost:3000/players/',
            dataType:'jsonp',
            success: (data) =>{
                //console.log(data);
                $.each(data, (name) =>{
                    console.log(name);
                });
            }
        });
    });

    $('#addNewPlayer').click(() =>{
        console.log("adding new players")
        $.post({
            url:'http://localhost:3000/players/',
            data: {
                name: $('#addPlayerName').val(),
                age: $('#addPlayerAge').val()
            },
            success: (data) =>{
                console.log('added enw player')
            }
        });
    });

    $('#submitResultBtn').click(() =>{
        console.log("btn result players")

        $.post({
            url:'http://localhost:3000/gameInfo/',
            data: {
                playerw: $('input:select[name=White]:selected').val(),
                playerb: $('input:select[name=Black]:selected').val(),
                result: $('input:select[name=Result]:selected').val(),
            },
            success: (data) =>{
                console.log('posted result: ' + data.playerw + ' ' + data.playerb + ' ' + data.result);
            }

        });
    });

    $('#playerInfoBtn').click(() =>{
        const reqURL = 'http://localhost:3000/players/'+$('#playerSelect').val();
        console.log("URL is: " + reqURL);

        $.get({
            url:reqURL,
            dataType:'json',
            success: (data) =>{
                const textToSet = 'Rating: ';
                $('#selPlayerRating').html(textToSet + data.rating);
            }
        });
    });


} );//End doc ready