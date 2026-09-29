import React, { createContext, useContext, useState } from 'react';
import { 
  LocationData, 
  RegionOfInterest, 
  ColourMeasurements, 
  ClassificationDetails 
} from '../types';

export interface TestSessionState {
  testId: string | null;
  operatorId: string;
  testedAt: string;
  location: LocationData;
  imageDataUrl: string | null;
  referenceCardRoi: RegionOfInterest | null;
  testRoi: RegionOfInterest | null;
  measurements: ColourMeasurements | null;
  classification: ClassificationDetails | null;
  imageHash: string | null;
  savedRecordId: string | null;
}

interface TestSessionContextType {
  session: TestSessionState;
  startNewSession: (testId: string, operatorId: string, location: LocationData) => void;
  setImage: (dataUrl: string) => void;
  setRegions: (refRoi: RegionOfInterest, testRoi: RegionOfInterest) => void;
  setAnalysisResults: (
    measurements: ColourMeasurements, 
    classification: ClassificationDetails, 
    hash: string
  ) => void;
  setSavedRecordId: (id: string) => void;
  resetSession: () => void;
}

const initialSession: TestSessionState = {
  testId: null,
  operatorId: 'OP-001 (DEMO)',
  testedAt: '',
  location: { status: 'not_requested' },
  imageDataUrl: null,
  referenceCardRoi: null,
  testRoi: null,
  measurements: null,
  classification: null,
  imageHash: null,
  savedRecordId: null,
};

const TestSessionContext = createContext<TestSessionContextType | undefined>(undefined);

export const TestSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<TestSessionState>(initialSession);

  const startNewSession = (testId: string, operatorId: string, location: LocationData) => {
    setSession({
      ...initialSession,
      testId,
      operatorId,
      testedAt: new Date().toISOString(),
      location,
    });
  };

  const setImage = (dataUrl: string) => {
    setSession((prev) => ({
      ...prev,
      imageDataUrl: dataUrl,
      // reset downstream analysis if image changes
      referenceCardRoi: null,
      testRoi: null,
      measurements: null,
      classification: null,
      imageHash: null,
      savedRecordId: null,
    }));
  };

  const setRegions = (refRoi: RegionOfInterest, testRoi: RegionOfInterest) => {
    setSession((prev) => ({
      ...prev,
      referenceCardRoi: refRoi,
      testRoi,
    }));
  };

  const setAnalysisResults = (
    measurements: ColourMeasurements,
    classification: ClassificationDetails,
    hash: string
  ) => {
    setSession((prev) => ({
      ...prev,
      measurements,
      classification,
      imageHash: hash,
    }));
  };

  const setSavedRecordId = (id: string) => {
    setSession((prev) => ({
      ...prev,
      savedRecordId: id,
    }));
  };

  const resetSession = () => {
    setSession(initialSession);
  };

  return (
    <TestSessionContext.Provider
      value={{
        session,
        startNewSession,
        setImage,
        setRegions,
        setAnalysisResults,
        setSavedRecordId,
        resetSession,
      }}
    >
      {children}
    </TestSessionContext.Provider>
  );
};

export const useTestSession = () => {
  const context = useContext(TestSessionContext);
  if (!context) {
    throw new Error('useTestSession must be used within a TestSessionProvider');
  }
  return context;
};
