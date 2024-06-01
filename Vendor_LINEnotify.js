
function doGet (request){
    var ss = SpreadsheetApp.openByUrl("URL-Spreadsheet");
    var customer_id = request.parameter.customer_id;
    var customer_name = request.parameter.customer_name;
    var order = request.parameter.order;
    var serving_time = encodeURIComponent(request.parameter.serving_time);
    var tel = String(request.parameter.tel);
    var sheet = ss.getActiveSheet();
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var order_time = today.getHours() +":" + today.getMinutes()+":"+today.getSeconds();
    sheet.appendRow([date,order_time,customer_id,customer_name,order,decodeURIComponent(serving_time),tel]);
    var result = {}
    result.result = 'added'
    var result = JSON.stringify(result);
    return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
   }
   

   function Notify() {
     var file = SpreadsheetApp.openByUrl('URL-Spreadsheet');
     var data_sheet = file.getSheetByName('Sheet1');
     
     var lastrow = data_sheet.getLastRow();
     
     for (var i = 1; i <= lastrow; i++) {
       try {
         var slip_verify = data_sheet.getRange(i, 8).getDisplayValue();
         var sentMessage = data_sheet.getRange(i, 9).getValue(); // Assuming the new column is in column I (9th column)
   
         if (slip_verify === 'T' && sentMessage === "") {
           var customer_name = data_sheet.getRange(i, 4).getValue();
           var customer_order = data_sheet.getRange(i, 5).getValue();
   
           // Format the serving time as plain text (HH:mm)
           var customer_ServeTime = padZero(data_sheet.getRange(i, 6).getValue().getHours()) + ":" + padZero(data_sheet.getRange(i, 6).getValue().getMinutes());
   
           // Format the ordering time as plain text (HH:mm)
           var customer_orderTime = padZero(data_sheet.getRange(i, 2).getValue().getHours()) + ":" + padZero(data_sheet.getRange(i, 2).getValue().getMinutes());
   
           var customer_Tel = data_sheet.getRange(i, 7).getValue();
   
           var text = "\nOrderTime " + customer_orderTime + "\n\nName: " + customer_name + "\nOrder: " + customer_order + "\nServeTime: " + customer_ServeTime + "\n\nTel. " + customer_Tel;
           var notification = { message: text }
   
           Sent_Notify(notification);
   
           // Update the SentMessage column to 'sent'
           data_sheet.getRange(i, 9).setValue('sent');
         }
       } catch (error) {
         Logger.log('Error at row ' + i + ': ' + error.message);
       }
     }
   }
   
   
   function Sent_Notify(notification) {
     var token = "input line token from https://notify-bot.line.me/en/"
     var option = {
       "method": "post",
       'payload': notification,
       "headers": { "Authorization": "Bearer " + token }
     };
     UrlFetchApp.fetch("https://notify-api.line.me/api/notify", option);
   }
   
   // Function to pad single-digit hours or minutes with a leading zero
   function padZero(number) {
     return number < 10 ? "0" + number : number;
   }