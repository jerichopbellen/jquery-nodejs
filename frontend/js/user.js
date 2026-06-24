$(document).ready(function () {
    const url = 'http://localhost:5000/';

    $("#register").on('click', function (e) {
        e.preventDefault();
        const name = $("#name").val();
        const email = $("#email").val();
        const password = $("#password").val();

        $.ajax({
            method: "POST",
            url: `${url}api/v1/register`,
            data: JSON.stringify({ name, email, password }),
            processData: false,
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            success: function (data) {
                console.log(data);
                Swal.fire({ icon: "success", text: "register success", position: 'bottom-right' });
            },
            error: function (error) {
                console.log(error);
                Swal.fire({ icon: "error", text: error.responseJSON?.message || "register failed" });
            }
        });
    });

    $('#avatar').on('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#avatarPreview').attr('src', e.target.result).show();
            };
            reader.readAsDataURL(file);
        }
    });

    $("#login").on('click', function (e) {
        e.preventDefault();

        const email = $("#email").val();
        const password = $("#password").val();

        $.ajax({
            method: "POST",
            url: `${url}api/v1/login`,
            data: JSON.stringify({ email, password }),
            processData: false,
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            success: function (data) {
                console.log(data);
                Swal.fire({
                    text: data.message || "welcome back",
                    showConfirmButton: false,
                    position: 'bottom-right',
                    timer: 1000,
                    timerProgressBar: true
                });

                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userId', String(data.user.id));
                sessionStorage.setItem('email', data.user.email);

                window.location.href = 'profile.html';
            },
            error: function (error) {
                console.log(error);
                Swal.fire({
                    icon: "error",
                    text: error.responseJSON?.message || "login failed",
                    showConfirmButton: false,
                    position: 'bottom-right',
                    timer: 1000,
                    timerProgressBar: true
                });
            }
        });
    });

    $("#updateBtn").on('click', function (event) {
        event.preventDefault();

        const rawUserId = sessionStorage.getItem('userId');
        const userId = rawUserId ? Number(rawUserId) : null;

        if (!userId) {
            Swal.fire({ icon: "error", text: "Please login first" });
            return;
        }

        const form = $('#profileForm')[0];
        const formData = new FormData(form);
        formData.set('userId', userId);

        $.ajax({
            method: "POST",
            url: `${url}api/v1/update-profile`,
            data: formData,
            contentType: false,
            processData: false,
            dataType: "json",
            success: function (data) {
                console.log(data);
                Swal.fire({
                    icon: "success",
                    text: data.message || "profile updated",
                    showConfirmButton: false,
                    position: 'bottom-right',
                    timer: 1200
                });
            },
            error: function (error) {
                console.log(error);
                Swal.fire({
                    icon: "error",
                    text: error.responseJSON?.message || error.responseJSON?.error || "profile update failed"
                });
            }
        });
    });

    $("#deactivateBtn").on('click', function (e) {
        e.preventDefault();
        const email = sessionStorage.getItem('email') || $("#email").val();

        $.ajax({
            method: "DELETE",
            url: `${url}api/v1/deactivate`,
            data: JSON.stringify({ email }),
            processData: false,
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            success: function (data) {
                console.log(data);
                Swal.fire({
                    text: data.message,
                    showConfirmButton: false,
                    position: 'bottom-right',
                    timer: 2000,
                    timerProgressBar: true
                });
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('email');
            },
            error: function (error) {
                console.log(error);
                Swal.fire({ icon: "error", text: error.responseJSON?.message || "deactivate failed" });
            }
        });
    });

    $("#home").load("header.html", function () {
        let cart = typeof getCart === "function" ? getCart() : [];
        let totalItems = cart.length;
        if (totalItems > 0) $('#itemCount').text(totalItems).show();
        else $('#itemCount').hide();
    });
});