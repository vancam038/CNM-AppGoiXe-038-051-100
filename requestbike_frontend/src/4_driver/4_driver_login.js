$(function () {
    $('.alert').hide();
    $('form').on('submit', function(e){
        e.preventDefault();
        var username = $('#userInput').val();
        var pwd = $('#pwdInput').val();
        var reqObject ={
            username,
            pwd
        }

        $.ajax({
            url:'http://localhost:3000/api/users/login',
            type:'POST',
            headers:{
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(reqObject),
            dataType:'json',
            success: function(){
                console.log("Login Success");
            },
            error:function(){
                console.log('Login Fail');
                $('#alert-danger').show();
            }
        })
    });
});