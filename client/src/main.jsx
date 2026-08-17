import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      limit={3}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover={false}
      pauseOnFocusLoss={false}
      draggable
      theme="dark"
      transition={Slide}
      toastClassName="sv-toast"
    />
    </BrowserRouter>
    </Provider>
    
  </React.StrictMode>,
)
