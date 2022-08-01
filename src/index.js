const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");
var AWS = require("aws-sdk");
AWS.config.update({ region: "eu-central-1" });
var dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const tableName = "Images"
var ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

const bot = new Telegraf("615286636:AAEGXzfTieEKF35KfDIQCUX8-UIWDTzlYoE")

// Обработчик начала диалога с ботом
bot.start((ctx) =>
    ctx.reply(
        `Приветствую, ${ctx.from.first_name ? ctx.from.first_name : "хороший человек"
        }! Набери /help и увидишь, что я могу.`
    )
);

// Обработчик команды /help
bot.help((ctx) => ctx.reply("Справка в процессе"));

// Обработчик команды /whoami
bot.command("whoami", (ctx) => {
    const { id, username, first_name, last_name } = ctx.from;
    return ctx.replyWithMarkdown(`Кто ты в телеграмме:
*id* : ${id}
*username* : ${username}
*Имя* : ${first_name}
*Фамилия* : ${last_name}
*chatId* : ${ctx.chat.id}`);
});

bot.command("photo", async (ctx) => {
    const response = await fetch("https://aws.random.cat/meow");
    const data = await response.json();
    return ctx.replyWithPhoto(data.file);
});

bot.command("list", async (ctx) => {
    try {
        const params = {
            TableName: tableName
        };
        const result = await dynamodb.scan(params).promise()

        console.log(result)

        const replyMessage = result.Items.reduce((acc, item) => {
            return acc += `${item.image.S}\n`
        }, '')

        console.log(replyMessage)

        return ctx.reply(replyMessage)
    } catch (error) {
        console.error(error);
    }
});

bot.command("add", async (ctx) => {
    const str = ctx.message.text
    const params = {
        TableName: tableName,
        Item: {
            'image': { S: str.split(" ").pop() },
            'format': { S: 'jpg' }
        }
    };

    console.log((str.split(" ").pop()))

    await dynamodb.putItem(params).promise()
});

// Обработчик простого текста
bot.on("text", (ctx) => {
    return ctx.reply(ctx.message.text);
});


exports.handler = (event, context, callback) => {
    const tmp = JSON.parse(event.body);
    bot.handleUpdate(tmp);
    return callback(null, {
        statusCode: 200,
        body: 'Its alive',
    });
  };
