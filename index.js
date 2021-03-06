const dsteem = require("dsteem")
const es = require("event-stream")

const MILLI_SECONDS_TO_COMPLETE = 3000
const MILLI_SECONDS_TO_COMPLETE_WITH_BUFFER = MILLI_SECONDS_TO_COMPLETE + 500
const HOME_DEGREES = 0
const TO_DEGREES = 180
const ACCOUNT_NAME = 'east.autovote'

// Steem Init
const client = new dsteem.Client('https://api.steemit.com')
const stream = client.blockchain.getOperationsStream()

var five = require("johnny-five");
var board = new five.Board({ port: "COM6" });

function handler() {
  console.log('move complete')
}

function returnToHome(servo){
  if(servo.value === TO_DEGREES) {
    servo.to(HOME_DEGREES, MILLI_SECONDS_TO_COMPLETE);
  }
}

board.on("ready", function() {
  var servo = new five.Servo({
    pin: 9,
    startAt: 0
  });
  servo.on('move:complete', handler)

  board.repl.inject({
    servo: servo
  });

  // Stream Steem Blockchain
  stream.on('data', async operation => {
    // Look for comment type of transaction
    if (operation.op[0] == 'transfer') {
      if (operation.op[1].to == ACCOUNT_NAME) {
        console.log("received transfer from: ", operation.op[1].from)
        servo.to(TO_DEGREES, MILLI_SECONDS_TO_COMPLETE);
        setTimeout(returnToHome.bind(null, servo), MILLI_SECONDS_TO_COMPLETE_WITH_BUFFER);
      }
    }
  })  // end: stream.on()

});
