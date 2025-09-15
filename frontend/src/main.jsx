import { BrowserRouter} from "react-router-dom";
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { store } from "./redux/store";
import './index.css'
import Root from "./App.jsx";


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <Root/>
    </BrowserRouter>
  </Provider>
)
