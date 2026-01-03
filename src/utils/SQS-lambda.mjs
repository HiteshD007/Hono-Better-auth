import axios from axios;

exports.handler = async (event) => {
  console.log('Received SQS event:', JSON.stringify(event, null, 2));
  
  try {
    // Since batch size is 1, there will be only one record
    const record = event.Records[0];
    
    // Parse the message body
    const messageBody = JSON.parse(record.body);
    console.log('Processing message:', messageBody);
    
    // Send message to your API route using axios
    const response = await axios.post('https://your-api-endpoint.com/route', {
      data: messageBody,
      messageId: record.messageId,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('API response:', response.status, response.data);
    
    // Return success - message will be deleted from queue
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Message processed successfully',
        messageId: record.messageId
      })
    };
    
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Throw error to keep message in queue for retry
    throw new Error(`Failed to process message: ${error.message}`);
  }
};