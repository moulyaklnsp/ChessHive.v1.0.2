import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ContactUs from './pages/ContactUs';
import Verify from './pages/auth/Verify';
import PlayerDashboard from './pages/player/PlayerDashboard';
import PlayerProfile from './pages/player/PlayerProfile';
import PlayerTournament from './pages/player/PlayerTournament';
import PlayerGrowth from './pages/player/PlayerGrowth';
import PlayerPairings from './pages/player/PlayerPairings';
import PlayerSettings from './pages/player/PlayerSettings';
import PlayerChat from './pages/player/PlayerChat';
import PlayerRankings from './pages/player/PlayerRankings';
import PlayerStore from './pages/player/PlayerStore';
import PlayerSubscription from './pages/player/PlayerSubscription';
import PlayerWatch from './pages/player/PlayerWatch';
import PlayerTv from './pages/player/PlayerTv';
import ThemePreview from './pages/player/ThemePreview';
import ThemePreview1 from './pages/player/ThemePreview1';
import ThemePreview2 from './pages/player/ThemePreview2';
import ThemePreview3 from './pages/player/ThemePreview3';
import ThemePreview1V2 from './pages/player/ThemePreview1V2';
import ThemePreview2V2 from './pages/player/ThemePreview2V2';
import ThemePreview3V2 from './pages/player/ThemePreview3V2';
import ThemePreview4V2 from './pages/player/ThemePreview4V2';
import ThemePreview5V2 from './pages/player/ThemePreview5V2';
import ThemePreview6V2 from './pages/player/ThemePreview6V2';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import CoordinatorChat from './pages/coordinator/CoordinatorChat';
import CoordinatorMeetings from './pages/coordinator/CoordinatorMeetings';
import CoordinatorProfile from './pages/coordinator/CoordinatorProfile';
import EnrolledPlayers from './pages/coordinator/EnrolledPlayers';
import FeedbackView from './pages/coordinator/FeedbackView';
import CoordinatorPairings from './pages/coordinator/CoordinatorPairings';
import CoordinatorPlayerStats from './pages/coordinator/CoordinatorPlayerStats';
import CoordinatorRankings from './pages/coordinator/CoordinatorRankings';
import StoreManagement from './pages/coordinator/StoreManagement';
import TournamentManagement from './pages/coordinator/TournamentManagement';
import CoordinatorStreamingControl from './pages/coordinator/CoordinatorStreamingControl';
import CollegeStats from './pages/organizer/CollegeStats';
import CoordinatorManagement from './pages/organizer/CoordinatorManagement';
import Meetings from './pages/organizer/Meetings';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import OrganizerTournament from './pages/organizer/OrganizerTournament';
import SalesAnalysis from './pages/organizer/SalesAnalysis';
import StoreMonitoring from './pages/organizer/StoreMonitoring';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTournamentManagement from './pages/admin/AdminTournamentManagement';
import AdminCoordinatorManagement from './pages/admin/AdminCoordinatorManagement';
import AdminOrganizerManagement from './pages/admin/AdminOrganizerManagement';
import AdminPlayerManagement from './pages/admin/AdminPlayerManagement';
import AdminPayments from './pages/admin/AdminPayments';
import ChessStory from './pages/ChessStory';
import ErrorPage from './pages/ErrorPage';

function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <About />
          </motion.div>
        } />
        <Route path="/story" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChessStory />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.6 }}
            style={{ perspective: 1000 }}
          >
            <Login />
          </motion.div>
        } />
        <Route path="/signup" element={
          <motion.div
            initial={location.state?.swapAnimation ? { opacity: 0, rotateY: -90 } : { opacity: 0 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={location.state?.swapAnimation ? { opacity: 0, rotateY: 90 } : { opacity: 0 }}
            transition={{ duration: location.state?.swapAnimation ? 0.6 : 0.5 }}
            style={{ perspective: 1000 }}
          >
            <Signup />
          </motion.div>
        } />
        <Route path="/verify" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Verify />
          </motion.div>
        } />
        <Route path="/contactus" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ContactUs />
          </motion.div>
        } />
        <Route path="/player/player_dashboard" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerDashboard />
          </motion.div>
        } />
        <Route path="/player/player_profile" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerProfile />
          </motion.div>
        } />
        <Route path="/player/player_tournament" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerTournament />
          </motion.div>
        } />
        <Route path="/player/growth" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerGrowth />
          </motion.div>
        } />
        <Route path="/player/pairings" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerPairings />
          </motion.div>
        } />
        <Route path="/player/settings" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerSettings />
          </motion.div>
        } />
        <Route path="/player/player_chat" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerChat />
          </motion.div>
        } />
        <Route path="/player/watch" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerWatch />
          </motion.div>
        } />
        <Route path="/player/tv/:provider" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerTv />
          </motion.div>
        } />
        <Route path="/player/rankings" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerRankings />
          </motion.div>
        } />
        <Route path="/player/store" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerStore />
          </motion.div>
        } />
        <Route path="/player/subscription" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayerSubscription />
          </motion.div>
        } />
        <Route path="/player/theme-preview" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview />
          </motion.div>
        } />
        <Route path="/player/theme-preview-1" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview1 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-2" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview2 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-3" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview3 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-1-v2" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview1V2 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-2-v2" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview2V2 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-3-v2" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview3V2 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-4-v2" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview4V2 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-5-v2" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview5V2 />
          </motion.div>
        } />
        <Route path="/player/theme-preview-6-v2" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemePreview6V2 />
          </motion.div>
        } />
        <Route path="/coordinator/coordinator_dashboard" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorDashboard />
          </motion.div>
        } />
        <Route path="/coordinator/coordinator_chat" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorChat />
          </motion.div>
        } />
        <Route path="/coordinator/coordinator_meetings" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorMeetings />
          </motion.div>
        } />
        <Route path="/coordinator/coordinator_profile" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorProfile />
          </motion.div>
        } />
        <Route path="/coordinator/enrolled_players" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EnrolledPlayers />
          </motion.div>
        } />
        <Route path="/coordinator/feedback_view" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FeedbackView />
          </motion.div>
        } />
        <Route path="/coordinator/pairings" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorPairings />
          </motion.div>
        } />
        <Route path="/coordinator/player_stats" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorPlayerStats />
          </motion.div>
        } />
        <Route path="/coordinator/rankings" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorRankings />
          </motion.div>
        } />
        <Route path="/coordinator/store_management" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StoreManagement />
          </motion.div>
        } />
        <Route path="/coordinator/tournament_management" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TournamentManagement />
          </motion.div>
        } />

        <Route path="/coordinator/streaming_control" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorStreamingControl />
          </motion.div>
        } />
        <Route path="/organizer/college_stats" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CollegeStats />
          </motion.div>
        } />
        <Route path="/organizer/coordinator_management" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoordinatorManagement />
          </motion.div>
        } />
        <Route path="/organizer/meetings" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Meetings />
          </motion.div>
        } />
        <Route path="/organizer/organizer_dashboard" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OrganizerDashboard />
          </motion.div>
        } />
        <Route path="/organizer/organizer_profile" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OrganizerProfile />
          </motion.div>
        } />
        <Route path="/organizer/organizer_tournament" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OrganizerTournament />
          </motion.div>
        } />
        <Route path="/organizer/sales_analysis" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SalesAnalysis />
          </motion.div>
        } />
        <Route path="/organizer/store_monitoring" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StoreMonitoring />
          </motion.div>
        } />
        <Route path="/admin/admin_dashboard" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminDashboard />
          </motion.div>
        } />
        <Route path="/admin/admin_tournament_management" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminTournamentManagement />
          </motion.div>
        } />
        <Route path="/admin/coordinator_management" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminCoordinatorManagement />
          </motion.div>
        } />
        <Route path="/admin/organizer_management" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminOrganizerManagement />
          </motion.div>
        } />
        <Route path="/admin/player_management" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminPlayerManagement />
          </motion.div>
        } />
        <Route path="/admin/payments" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminPayments />
          </motion.div>
        } />

        <Route
          path="*"
          element={<Navigate to="/error?title=Not%20Found&message=The%20page%20you%20requested%20does%20not%20exist.&code=404" replace />}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
