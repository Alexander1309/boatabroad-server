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

module.exports = msg