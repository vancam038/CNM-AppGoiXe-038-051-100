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
    let redirect = function(permission){
        // window.open('../1_request-receiver/1_request-receiver.html','_blank');
        switch(permission){
            case 1:
                openInNewTab('../1_request-receiver/1_request-receiver.html');
                break;
            case 2:
                openInNewTab('../2_location-indentifier/2_location-indentifier.html');
                break;
            case 3:
                openInNewTab('../3_request-management/3_request-management.html');
                break;
            case 4:
                openInNewTab('../4_driver/4_driver.html');
                break;
        }
    };
    let openInNewTab = function(url) {
        $("<a>").attr("href", url).attr("target", "_self")[0].click();
    };
    //handle effect
    $('.role-option').on('click', function(){
        var index = $(this).index();
        // Cộng 1 để giống với số của phân hệ
        index = index + 1;
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
            url:'http://localhost:3000/auth/login',
            type:'POST',
            headers:{
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(reqObject),
            dataType:'json',
            success: function(data){
                console.log(data);
                if(data.auth) {
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('refToken',data.refresh_token);
                    $('#alert-success').show();
                    //chuyen huong trang theo loai tai khoan

                    setTimeout(function(){
                        redirect(data.type);
                    },1000);
                }else{
                    console.log("Login Failed!");
                    $('#alert-danger').show();
                }
            },
            error:function(){
                console.log(data);
                console.log('Login Failed!');
                $('#alert-danger').show();
            }
        })
    });
});
