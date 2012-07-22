(function(){
    var user = $('.pagetop:eq(1)').find('a').first().text();

    //highlight comments
    var pathnames = ['/item', '/threads', '/newcomments'];
    if(pathnames.indexOf(window.location.pathname) !== -1){
        var focus_num = 0;
        $.ajax({
            url: 'http://followhackers.danielnill.com/get_hackers/',
            type: 'GET', 
            dataType: 'json',
            data: {'user': user},
            async: false,
            success: function(data){
                $('center').first().append('<span style="position: fixed; top:225px; right: 4%;"><a href="javascript:self.moveTo(3000,200)" id="follow_hackers_nav">V<br/>V</a></span>');
                
                if(data.length > 0){
                    var count = 0;
                    $('.comhead').each(function(i){
                        if(i !== 0){
                            var hacker = $(this).children('a').first().text();
                            if(data.indexOf(String(hacker)) !== -1){
                                //if user selected a color use that otherwise use default
                                $(this).children().first().css({'color': '#ff6600'});
                                $(this).parent().parent().prepend('<span id="follow_hackers_' + count + '"></span>');
                                count++;
                            }
                        }
                    });
                }

                //listener to change out bookmark link everytime the nav is clicked
                $('#follow_hackers_nav').click(function(e){
                    //scroll back to first comment if we are at the last one.
                    if(focus_num >= count){
                        focus_num = 0;
                        document.getElementById('follow_hackers_' + focus_num).scrollIntoView();
                    }
                    else{
                        document.getElementById('follow_hackers_' + focus_num).scrollIntoView();
                        focus_num++;
                    }
                });
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
            url: 'http://followhackers.danielnill.com/hackers_stories/',
            data: {"user": user, "story_ids": story_ids.join(',')},
            dataType: 'json',
            type: 'get',
            success: function(data){
                $('.subtext').each(function(i){
                    var story = $(this).children().last().attr('href');
                    // handle for stories without comment links
                    if(story !== undefined){
                        if(data.indexOf(Number(story.split('=')[1])) != -1){
                            $(this).children().last().css({'color': '#ff6600'});
                        }
                        else{
                            //console.log(story.split('=')[1]);
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
            url: "http://followhackers.danielnill.com/is_following/",
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
                    url: "http://followhackers.danielnill.com/unfollow/",
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
                    url: "http://followhackers.danielnill.com/follow/",
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
            url: 'http://followhackers.danielnill.com/get_hackers/',
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




