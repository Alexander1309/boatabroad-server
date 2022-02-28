const msg = {}

msg.msgNewPost = id => `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Correo</title>
        <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .container {
            width: 100%;
            height: 200px;
            background-color: #00BFC1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px 40px;
        }

        .container2 {
            width: 100%;
            height: 80px;
            background-color: #000;
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
            padding: 15px 40px;
        }

        .title {
            color: white;
            font-size: 28px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .footer__text {
            color: white;
            font-family: Arial, Helvetica, sans-serif;
        }
        </style>
    </head>
    <body>
        <header class="container">
            <h1 class="title">Template email for Boataboard</h1>
        </header>

        <div>
            New Post para verificar by id ${id}
        </div>

        <footer class="container2">
            <h4 class="footer__text">Todos los derechos reservados | Boatabroad</h4>
        </footer>
    </body>
</html>
`

msg.msgSecurityCode = (name, text, code) =>`
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Register</title>
    <style>
        * {
            padding: 0;
            margin: 0;
        } 
    
        .container {
            font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 20px;
        }
    
        .header {
            border-bottom: 1px solid #c9c9c9;
        }
    
        .px-5 {
            margin-bottom: 20px;
        }
    
        .px-10 {
            margin-bottom: 40px;
        }
    
        .px-20 {
            margin-bottom: 80px;
        }
    
        .py-5 {
            margin-top: 20px;
            margin-bottom: 20px;
        }
    
        .py-10 {
            margin-top: 40px;
            margin-bottom: 40px;
        }
    
        .bg-aqua {
            color: #00BFC1;
        }
    
        .code {
            width: 20%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f9f9f9;
            height: 40px;
            font-size: 30px;
            font-weight: 600;
        }
    
        .line-height {
            line-height: 1.5;
        }
    
        .image {
            height: 50px;
        }
    
    </style>
</head>


<body class="container">
    <!-- Header -->
 <div class="header">
    <img class="image py-10" src="https://boatabroad.vercel.app/assets/img/logo/boatabroad-icon.svg" alt="boatabroad logo">
    <h2 class="px-5 bg-aqua">Hi ${name}!</h2>
    <p class="px-10 line-height">${text}</p>
    <p class="px-5">This is your code:</p>
    <span class="code px-20">${code}</span>
    <p class="line-height px-10">Thanks,<br>
        The Boatabroad team</p>
 </div>  
 
 <!-- Footer -->
 <div class="py-5">
    <p>Boatabroad. All right reserved</p>
 </div>
</body>
</html>
`

msg.postUpdated = (user, post) => {
    const reviewUrl = `${process.env.WEB_URL}/dashboard/boatReview?id=${encodeURIComponent(post._id)}`
    return`<!DOCTYPE html>
<html lang="en">
    <body>
        <h1>Boat updated</h1>
        The post '${post.title}' has been updated by ${user.name} ${user.surname}. In order to verify the changes, click on the link below.
        <a href="${reviewUrl}">${reviewUrl}</a>
    </body>
</html>`
}

msg.postApproved = (post) => {
    const postUrl = `${process.env.WEB_URL}/search/details?id=${encodeURIComponent(post._id)}`
    return`<!DOCTYPE html>
<html lang="en">
    <body>
        <h1>Post approved</h1>
        The post '${post.title}' has been approved.<br><br> Now it's publicly available in the following link:
        <br>
        <a href="${postUrl}">${postUrl}</a>
    </body>
</html>`
}

msg.postRejected = (post, reason) => {
    const editPostUrl = `${process.env.WEB_URL}/dashboard/boatForm?boatId=${encodeURIComponent(post._id)}`
    return`<!DOCTYPE html>
<html lang="en">
    <body>
        <h1>Post rejected</h1>
        The post '${post.title}' has been rejected since it does not meet the requirements.<br><br> This is the reason:<br><br><i><b>${reason}</b></i><br><br> In order to modify the post, click on the link below.
        <br>
        <a href="${editPostUrl}">${editPostUrl}</a>
    </body>
</html>`
}

module.exports = msg