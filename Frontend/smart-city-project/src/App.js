import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import AboutSection from "./components/AboutSection";
import ReportIssue from "./components/ReportIssue";
import Auth from "./components/Auth";
import Stats from "./components/Stats";
import ForumDetail from './components/ForumDetail';
import CreateForumPost from "./components/CreateForumPost";
import ReportIssuePage from "./components/ReportIssuePage";
import SubmitIdeaPage from "./components/SubmitIdeaPage";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import SubmitIdeas from "./components/SubmitIdeas";
import CommunityProjects from "./components/CommunityProjects";
import Footer from "./components/Footer";
import ForumPage from "./components/ForumPage";
import ReportIssuesPanel from './components/ReportIssuesPanel';
import IssueStatusManager from './components/IssueStatusManager';
import ForumModerationPanel from './components/ForumModerationPanel';
import AdminIdeaApproval from './components/AdminIdeaApproval';
import AdminIdeaStatusManager from './components/AdminIdeaStatusManager';
import AdminSystemSettings from './components/AdminSystemSettings';
import StatusLog from "./components/StatusLog";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Main Landing Page (with Header) */}
        <Route path="/" element={
          <>
            <Header />
            <AboutSection />
            <ReportIssue />
            <Stats />
            <SubmitIdeas />
            <CommunityProjects />
            <Footer />
          </>
        } />

        {/* ❌ No Header for Auth Page */}
        <Route path="/auth" element={<Auth />} />

        {/* ❌ No Header for Profile Page */}
        <Route path="/profile/:username" element={<Profile />} />
        
        <Route path="/report" element={<ReportIssuePage />} />
        <Route path="/submit" element={<SubmitIdeaPage />} />
        <Route path="/forum" element={<ForumPage/>}/>
        <Route path="/forum/:id" element={<ForumDetail />} />
        <Route path="/forum/new" element={<CreateForumPost />} />
      
      </Routes>
        <Routes>
        <Route path="/admin" element ={<AdminDashboard/>} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/admin/ideas" element={<AdminIdeaApproval />} />
        <Route path="/admin/ideas/status" element={<AdminIdeaStatusManager />} />
        <Route path="/admin/issues" element={<ReportIssuesPanel />} />
        <Route path="/admin/issues/status" element={<IssueStatusManager />} />
        <Route path="/admin/users" element={<ForumModerationPanel />} />
        <Route path="/admin/settings" element={<AdminSystemSettings />} />
        <Route path="/admin/logs" element={<StatusLog />} />
        </Routes>
    </Router>
  );
}

export default App;
