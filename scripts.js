const Modal = {
   toggleActive() {
      document
         .querySelector('.modal-overlay') //search for the class
         .classList //retreave classList
         .toggle('active')
   }
}

// acessando o LocalStorage 
const Storage = {
   get() {  
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] 
   },

   set(transactions) {
      localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
   }
}  

const Transaction = {
   all: Storage.get(),

   add(transaction) {
      Transaction.all.push(transaction) //push() inclui em um array o dado informado.
      App.reload()
   },

   remove(index) {
      Transaction.all.splice(index, 1) //splice() se aplica em arrays. Remove o item do array e poe o seguinte na sua posicao. A partir do index passado, deleta 1 item

      App.reload()
   },

   incomes() {
      let income = 0

      Transaction.all.forEach(tran => {
         tran.amount > 0 ? income = income + tran.amount : ""
      })
      return income
   },

   expenses() {
      let expenses = 0

      Transaction.all.forEach(exp => {
         exp.amount < 0 ? expenses = expenses + exp.amount : ""
      })
      return expenses
   },

   total() {
      return Transaction.incomes() + Transaction.expenses()
   }
}

const DOM = {
   transactionsContainer: document.querySelector('#data-table tbody'),

   addTransaction(transaction, index) { //index, onde ele vai colocar a transacao. em que local do documento
      const tr = document.createElement('tr') //cria a tag <tr>
      tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) //chama o método e insere innerHTML no <tr>
      tr.dataset.index = index
      DOM.transactionsContainer.appendChild(tr)
   },

   innerHTMLTransaction(transaction, index) {
      const CSSClass = transaction.amount > 0 ? "income" : "expense" //para colocar a classe de acordo com valor de amount

      const html = `
         <td class="description">${transaction.description}</td>
         <td class="${CSSClass}">${Utils.formatCurrence(transaction.amount)}</td>
         <td class="date">${transaction.date}</td>
         <td>
            <img class="btn-remove" onclick="Transaction.remove(${index})" src="./img/minus.svg" alt="Remover transação">
         </td>
      `
      return html
   },

   updateBalance() {
      document
         .getElementById('incomeDisplay')
         .innerHTML = Utils.formatCurrence(Transaction.incomes())
      document
         .getElementById('expenseDisplay')
         .innerHTML = Utils.formatCurrence(Transaction.expenses())
      document
         .getElementById('totalDisplay')
         .innerHTML = Utils.formatCurrence(Transaction.total())
   },

   clearTransactions() {
      DOM.transactionsContainer.innerHTML = ""
   }
}

const Utils = {
   formatCurrence(value) {
      const signal = Number(value) < 0 ? '-' : '' //transforma value em numero. Se menor que 0, recebe negativo. Se positivo, nao recebe nada.
      value = String(value).replace(/\D/g, "") //primeiro o que buscar, segundo trocar por. // é o delimitador de REGEX. \D Encontra correspondência com um caractere que não seja número. O g é para procurar e trocar na string inteira e nao só na primeira ocorrencia.
      value = Number(value) / 100 //fazer as casas decimais 
      value = value.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      })

      return (signal + value)
   },

   formatAmount(value) {
      value = value * 100
   
      return Math.round(value)
   },

   formatDate(date) {
      const splittedDate = date.split("-")
      return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
   }
}

const Form = {
   description: document.querySelector('input#description'), //pegando o input com id=description
   amount: document.querySelector('input#amount'),
   date: document.querySelector('input#date'),

   getValues() {
      return {
         description: Form.description.value, //pegando o value do input#description
         amount: Form.amount.value,
         date: Form.date.value
      }
   },

   validateFields() {
      const { description, amount, date } = Form.getValues() //desestruturação de dados. Cria 3 const com os nomes entre {}
      if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
         throw new Error("Preencha todos os campos")
      }
   },

   formatValues() {
      let { description, amount, date } = Form.getValues()
      amount = Utils.formatAmount(amount)
      date = Utils.formatDate(date)

      return {
         description,
         amount,
         date
      }
   },

   clearFields() {
      Form.description.value = ""
      Form.amount.value = ""
      Form.date.value = ""
   },

   submit(event) {
      event.preventDefault()

      try {
         Form.validateFields()
         const transaction = Form.formatValues()
         Transaction.add(transaction)
         Form.clearFields()
         Modal.toggleActive()

      } catch (error) {
         alert(error.message)
      }
   }
}

const App = {
   init() {
      //preenche a tabela ao abrir a página
      Transaction.all.forEach((transaction, index) => {
         DOM.addTransaction(transaction, index)
      })

      DOM.updateBalance()

      const CSSClass = Transaction.total() < 0 ? "negative" : "positive" //para colocar a classe de acordo com valor de amount
      document.getElementById("card-total").classList.remove('positive');
      document.getElementById("card-total").classList.remove('negative');
      document.getElementById('card-total').classList.add (`${CSSClass}`)

      Storage.set(Transaction.all)
   },

   reload() {
      DOM.clearTransactions()
      App.init()
   }
}

App.init()

// [{
//    description: 'Luz',
//    amount: Number('-50000'),
//    date: '23/01/2021',
// }, {
//    description: 'Website',
//    amount: Number('056'),
//    date: '23/01/2021',
// }, {
//    description: 'Internet',
//    amount: Number('-25000'),
//    date: '23/01/2021',
// }, {
//    description: 'App mobile',
//    amount: Number('900000'),
//    date: '23/01/2021',
// }],