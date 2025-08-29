function handleApuracao(note) {
  // Get the item ID (you'll need to determine how to identify the specific item)
  const itemId = getItemId(); // Replace getItemId() with your logic

  // Send the data to your backend or update the UI as needed
  console.log(`Item ID: ${itemId}, Note: ${note}`);
  // Example: Send data to backend using fetch
  // fetch('/api/updateItem', {
  //   method: 'POST',
  //   body: JSON.stringify({ itemId: itemId, note: note, status: 'apuracao' }),
  //   headers: { 'Content-Type': 'application/json' }
  // })
  // .then(response => response.json())
  // .then(data => {
  //   console.log('Success:', data);
  // })
  // .catch((error) => {
  //   console.error('Error:', error);
  // });

  // Update the UI to reflect the "apuracao" status
  updateItemStatus(itemId, 'apuracao');
}

function getItemId() {
  // Replace this with your actual logic to get the item ID
  // This will depend on how your ITB circle and data are structured
  return '123'; // Example: Hardcoded item ID
}

function updateItemStatus(itemId, status) {
  // Replace this with your actual UI update logic
  console.log(`Item ${itemId} status updated to ${status}`);
}