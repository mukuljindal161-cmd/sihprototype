import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TestSessionProvider } from './context/TestSessionContext';
import { Layout } from './components/Layout';
import { FlowGuard } from './components/FlowGuard';

// Pages
import { Home } from './pages/Home';
import { StartTest } from './pages/StartTest';
import { Capture } from './pages/Capture';
import { Review } from './pages/Review';
import { Analysis } from './pages/Analysis';
import { Result } from './pages/Result';
import { Saved } from './pages/Saved';
import { History } from './pages/History';
import { RecordDetails } from './pages/RecordDetails';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <TestSessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Entry Routes */}
            <Route index element={<Home />} />
            <Route path="test/new" element={<StartTest />} />

            {/* Workflow Guided Routes */}
            <Route
              path="test/capture"
              element={
                <FlowGuard>
                  <Capture />
                </FlowGuard>
              }
            />
            <Route
              path="test/review"
              element={
                <FlowGuard requireImage>
                  <Review />
                </FlowGuard>
              }
            />
            <Route
              path="test/analysis"
              element={
                <FlowGuard requireImage requireRegions>
                  <Analysis />
                </FlowGuard>
              }
            />
            <Route
              path="test/result"
              element={
                <FlowGuard requireImage requireRegions requireAnalysis>
                  <Result />
                </FlowGuard>
              }
            />
            <Route path="test/saved" element={<Saved />} />

            {/* Audit & Record History Routes */}
            <Route path="records" element={<History />} />
            <Route path="records/:id" element={<RecordDetails />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TestSessionProvider>
  );
};
