$(function () {
    var type = -1;
    let onSuccess = function(data){
        console.log(data);
        if(data.auth) {
            let cookie = {
                "x-access-token": data.access_token,
                "ref-token": data.refresh_token,
                // "expires": data.expires
            };
            let cookieStr = JSON.stringify(cookie);
            //$.cookie("com.requestbike-ss.app", JSON.stringify(cookie));
            setCookie("com.requestbike-ss.app",cookieStr,data.expires);
            console.log("Login Success!");
            $('#alert-success').show();
        }else{
            console.log('Login Fail');
            $('#alert-danger').show();
        }
    };

    let onError = function(){
        console.log('No connection!');
        $('#alert-danger').show();
    };

    let setCookie = function(name,value,expTime){
        var d = new Date();
        d.setTime(d.getTime() + (expTime*1000)); //in miliseconds
        var expires = d.toUTCString();
        // document.cookie = `${name}=${value};exprires=${expires};path=/`;
        $.cookie(`${name}=${value};exprires=${expires};path=/`);
    };
    /////////////
    $('.role-option').on('click', function(){
        var index = $(this).index();
        console.log('selected: ' + index);
        type = index;
        $('.role-option').not(this).each(function(){
            $(this).removeClass('role-active');
            $(this).addClass('role-inactive');
        });
        $(this).removeClass('role-inactive');
        $(this).addClass('role-active');
        $('#form').addClass('active');
    });
    $('form').on('submit', function(e){
        e.preventDefault();
        var username = $('#userInput').val();
        var pwd = $('#pwdInput').val();
        var reqObject ={
            username,
            pwd,
            type
        };
        $.ajax({
            url:'http://localhost:3000/user/login',
            type:'POST',
            headers:{
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(reqObject),
            dataType:'json',
            success: onSuccess,
            error:onError
        })
    });
});
