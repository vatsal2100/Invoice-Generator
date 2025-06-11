document.addEventListener('DOMContentLoaded', function() {
  const addItemBtn = document.getElementById('add-item');
  const generateBtn = document.getElementById('generate');
  const printBtn = document.getElementById('print');
  const itemsDiv = document.getElementById('items');
  const invoicePreview = document.getElementById('invoice-preview');
  const taxRateInput = document.getElementById('tax-rate');
  const discountInput = document.getElementById('discount');

  // Add item row
  addItemBtn.addEventListener('click', function() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <input type="text" placeholder="Description" name="description">
      <input type="number" placeholder="Quantity" name="quantity" min="1">
      <input type="number" placeholder="Price" name="price" step="0.01" min="0">
      <button type="button" class="remove-item">Remove</button>
    `;
    itemsDiv.appendChild(itemDiv);
  });

  // Remove item row
  itemsDiv.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item')) {
      e.target.parentElement.remove();
    }
  });

  // Generate invoice preview
  generateBtn.addEventListener('click', function() {
    const form = document.getElementById('invoice-form');
    const data = {};
    data.business = form.business.value;
    data.client = form.client.value;
    data.invoiceNumber = form.invoiceNumber.value || 'INV-' + Date.now().toString().slice(-4);
    data.invoiceDate = form.invoiceDate.value;
    data.dueDate = form.dueDate.value;
    data.notes = form.notes.value || 'None';
    data.taxRate = parseFloat(taxRateInput.value) || 0;
    data.discount = parseFloat(discountInput.value) || 0;

    // Collect items
    data.items = [];
    const itemRows = itemsDiv.querySelectorAll('.item');
    itemRows.forEach(row => {
      const item = {
        description: row.querySelector('[name="description"]').value,
        quantity: parseFloat(row.querySelector('[name="quantity"]').value) || 1,
        price: parseFloat(row.querySelector('[name="price"]').value) || 0
      };
      item.subtotal = item.quantity * item.price;
      data.items.push(item);
    });

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * (data.taxRate / 100);
    const discount = data.discount;
    const total = subtotal + tax - discount;

    // Render preview
    invoicePreview.innerHTML = `
      <h2>Invoice</h2>
      <p><strong>From:</strong> ${data.business}</p>
      <p><strong>To:</strong> ${data.client}</p>
      <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
      <p><strong>Date:</strong> ${data.invoiceDate}</p>
      <p><strong>Due:</strong> ${data.dueDate}</p>
      <table>
        <tr><th>Description</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
        ${data.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
      <p><strong>Tax (${data.taxRate}%):</strong> $${tax.toFixed(2)}</p>
      <p><strong>Discount:</strong> $${discount.toFixed(2)}</p>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <p><strong>Notes:</strong> ${data.notes}</p>
    `;
  });

  // Print invoice
  printBtn.addEventListener('click', function() {
    window.print();
  });
});
document.getElementById('export-pdf').addEventListener('click', function() {
  const element = document.getElementById('invoice-preview');
  const opt = {
    margin:       10,
    filename:     'invoice.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save();
});

