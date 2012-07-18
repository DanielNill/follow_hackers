(function(){
    var user = $('.pagetop:eq(1)').find('a').first().text();

    //highlight comments
    var pathnames = ['/item', '/threads', '/newcomments'];
    if(pathnames.indexOf(window.location.pathname) !== -1){
        $.ajax({
            url: 'http://localhost:5000/get_hackers/',
            type: 'GET', 
            dataType: 'json',
            data: {'user': user},
            async: false,
            success: function(data){
                if(data.length > 0){
                    console.log(data);
                    $('.comhead').each(function(i){
                        if(i !== 0){
                            var hacker = $(this).children('a').first().text();
                            console.log(hacker);
                            if(data.indexOf(String(hacker)) !== -1){
                                $(this).parent().parent().css('background-color', 'yellow');
                            }
                        }
                    });
                }
            }
        });
    }

    //highlight stories with followed hackers
    var pathnames = ['/news', '/newest', '/x', '/ask'];
    if(pathnames.indexOf(window.location.pathname) !== -1){
        //get story ids
        var story_ids = []
        $('.subtext').each(function(i){
            var story = $(this).children().last().attr('href');
            if(story !== undefined){
                story_ids.push(story.split('=')[1]);
            }
        });

        //get stories with followed hackers
        $.ajax({
            url: 'http://localhost:5000/hackers_stories/',
            data: {"user": user, "story_ids": story_ids.join(',')},
            dataType: 'json',
            type: 'get',
            success: function(data){
                console.log(data);
                $('.subtext').each(function(i){
                    var story = $(this).children().last().attr('href');
                    // handle for stories without comment links
                    if(story !== undefined){
                        if(data.indexOf(Number(story.split('=')[1])) != -1){
                            $(this).css('background-color', 'yellow');
                        }
                        else{
                            console.log(story.split('=')[1]);
                        }
                    }
                });
            }
        })
    }
    
    var hacker = window.location.search.split('=')[1];

    //if they are viewing someone's user page allow them to follow or unfollow
    if(window.location.pathname == '/user' && hacker !== user){
        //check if they are currently following the user
        $.ajax({
            url: "http://localhost:5000/is_following/",
            data: {"hacker": hacker, "user": user},
            type: 'GET',
            dataType: "json",
            success: function(data){
                display_options(data, user, hacker);
            }
        });
    }

    function display_options(is_following, user, hacker){
        if(is_following){
            var link = $('<a href="javascript: void(0)"><u>Unfollow</u></a>');
        }
        else{
            var link = $('<tr><td></td><td><a href="javascript: void(0)"><u>Follow</u></a><td></tr>');
        }

        $(link).click(function(e){
            if(is_following){
                //make ajax call to unfollow
                $.ajax({
                    url: "http://localhost:5000/unfollow/",
                    type: 'POST',
                    data: {"hacker": hacker, "user": user},
                    dataType: "json",
                    success: function(data){
                        display_options(false, user, hacker);
                    }
                })
            }
            else{
                //make ajax call to follow
                $.ajax({
                    url: "http://localhost:5000/follow/",
                    type: 'POST',
                    data: {'hacker': hacker, 'user': user},
                    dataType: 'json',
                    success: function(data){
                        display_options(true, user, hacker);
                    }
                })
            }
        });

        $('table:eq(2)').append('<tr><td></td><td id="follow_link"></td></tr>');
        $('#follow_link').html(link);
        
    }

    //if they are on their page display the users they are following
    if(window.location.pathname == '/user' && hacker == user){
        $.ajax({
            url: 'http://localhost:5000/get_hackers/',
            type: 'GET', 
            dataType: 'json',
            data: {'user': user},
            success: function(data){
                if(data.length > 0){
                    $('table:eq(2)').append('<tr><td></td></tr><tr><td></td><td>Following:</td></tr>');
                    $(data).each(function(i){
                        $('table:eq(2)').append('<tr><td></td><td><a href="/user?id=' + data[i] + '"><u>' + data[i] + '</u></a></td></tr>');
                    });
                }
            }
        });
    }
}());




