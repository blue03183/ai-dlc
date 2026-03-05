import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Routes will be added in subsequent steps */}
      <Route path="*" element={<div>테이블오더 관리자 앱</div>} />
    </Routes>
  );
}

export default App;
