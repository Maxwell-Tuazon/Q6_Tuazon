import { Container } from 'react-bootstrap';

import Header from './components/Header';
import Footer from './components/Footer';

import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import DetailScreen from './screens/DetailScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import UserScreen from './screens/UserScreen';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import ApplySeller from './screens/ApplySeller';
import SellerDashboard from './screens/SellerDashboard';
import UserProfile from './screens/UserProfile';
import SubscriptionScreen from './screens/SubscriptionScreen';
import SubscriptionList from './screens/SubscriptionList';
import AdminUsers from './screens/AdminUsers';
import AdminApplications from './screens/AdminApplications';
import ProtectedRoute from './components/ProtectedRoute';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Header />
      <main className='py-3'>

        <Container>
          <Routes>
            <Route path='/User' element={<UserScreen />} />
            <Route path='/signin' element={<SignIn />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/apply-seller' element={<ProtectedRoute><ApplySeller /></ProtectedRoute>} />

            <Route path='/' element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} exact />
            <Route path='/service/:id' element={<ProtectedRoute><DetailScreen /></ProtectedRoute>} />
            <Route path='/product/:id' element={<ProtectedRoute><ProductScreen /></ProtectedRoute>} />

            <Route path='/seller/dashboard' element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

            <Route path='/chat' element={<ProtectedRoute><ChatbotScreen /></ProtectedRoute>} />

            <Route path='/subscriptions' element={<ProtectedRoute><SubscriptionScreen /></ProtectedRoute>} />
            <Route path='/admin/subscriptions' element={<ProtectedRoute><SubscriptionList /></ProtectedRoute>} />
            <Route path='/admin/users' element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path='/admin/applications' element={<ProtectedRoute><AdminApplications /></ProtectedRoute>} />
          </Routes>
        </Container>

      </main>
      <Footer />
    </Router>
  );
}

export default App;
