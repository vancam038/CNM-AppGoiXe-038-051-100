$(function () {
    var type = null;
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
        }
        $.ajax({
            url:'http://localhost:3000/user/login',
            type:'POST',
            headers:{
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(reqObject),
            dataType:'json',
            success: function(data){
                console.log(data);
            },
            error:function(){
                console.log('Login Fail');
                $('#alert-danger').show();
            }
        })
    });
});