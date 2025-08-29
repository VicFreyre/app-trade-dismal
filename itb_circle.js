// itb_circle.js

// Assuming you have a way to identify the ITB circle element
const itbCircle = document.getElementById('itbCircle'); // Replace 'itbCircle' with the actual ID

itbCircle.addEventListener('click', () => {
  // Display the modal
  openApuracaoModal();
});

function openApuracaoModal() {
  // Create the modal dynamically (or load from a separate HTML file)
  const modal = document.createElement('div');
  modal.id = 'apuracaoModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';

  const noteLabel = document.createElement('label');
  noteLabel.textContent = 'Add Note:';
  const noteInput = document.createElement('textarea');
  noteInput.id = 'apuracaoNote';

  const apuracaoButton = document.createElement('button');
  apuracaoButton.textContent = 'Set to Apuracao';
  apuracaoButton.addEventListener('click', () => {
    const note = document.getElementById('apuracaoNote').value;
    handleApuracao(note); // Call the function in apuracao.js
    closeApuracaoModal();
  });

  modalContent.appendChild(noteLabel);
  modalContent.appendChild(noteInput);
  modalContent.appendChild(document.createElement('br'));
  modalContent.appendChild(apuracaoButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function closeApuracaoModal() {
  const modal = document.getElementById('apuracaoModal');
  modal.remove();
}