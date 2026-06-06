import { useMemo, useState } from 'react';
import {
  FaBrain,
  FaChartBar,
  FaChartLine,
  FaFileAlt,
  FaHome,
  FaImage,
  FaList,
  FaPencilAlt,
  FaPlus,
  FaUserCircle,
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';

const starterQuizzes = [
  {
    id: 'quiz-1',
    title: 'Soal Quiz 1',
    category: 'Layanan Web',
    questions: [
      {
        text: 'Apa fungsi utama dari sistem operasi dalam sebuah komputer?',
        answers: [
          'Melakukan perhitungan matematika yang kompleks.',
          'Mengelola sumber daya perangkat keras dan menyediakan layanan untuk aplikasi.',
          'Menyimpan data secara permanen di dalam hard disk.',
          'Menghubungkan komputer langsung ke jaringan internet tanpa kabel.',
        ],
        correct: 'B',
      },
    ],
  },
  { id: 'quiz-2', title: 'Soal Quiz 2', category: 'Layanan Web', questions: [] },
  { id: 'quiz-3', title: 'Soal Quiz 3', category: 'Pemrograman Internet', questions: [] },
  { id: 'quiz-4', title: 'Soal Quiz 4', category: 'Pemrograman Internet', questions: [] },
];

function Brand() {
  return (
    <strong className="brand">
      SMARTQ <FaBrain className="brand-icon" aria-hidden="true" />
    </strong>
  );
}

function HomePage({ onNavigate, onPlay }) {
  const [pin, setPin] = useState('');

  const handlePin = (event) => {
    event.preventDefault();
    onPlay();
  };

  return (
    <section className="page blue-page home-page">
      <nav className="top-nav">
        <button className="nav-button active" type="button" onClick={() => onNavigate('home')}><FaHome /> Beranda</button>
        <button className="nav-button" type="button" onClick={() => onNavigate('login')}><FaPencilAlt /> Buat Kuis</button>
      </nav>

      <div className="home-content">
        <Brand />
        <form className="pin-card" onSubmit={handlePin}>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Pin Soal"
            inputMode="numeric"
          />
          <button type="submit" disabled={pin.length < 4}>Masuk</button>
          <p>{pin.length >= 4 ? 'PIN siap digunakan' : ''}</p>
        </form>
      </div>
    </section>
  );
}

function AuthPage({ mode, onNavigate }) {
  const isRegister = mode === 'register';

  const handleSubmit = (event) => {
    event.preventDefault();
    onNavigate('dashboard');
  };

  return (
    <section className="page blue-page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" placeholder="Masukkan Email Anda" required />

        <label>Kata Sandi:</label>
        <input type="password" placeholder="Masukkan Kata Sandi Anda" minLength={isRegister ? 8 : undefined} required />

        {isRegister && (
          <>
            <label>Konfirmasi Kata Sandi:</label>
            <input type="password" placeholder="Konfirmasi Kata Sandi Anda" minLength="8" required />
          </>
        )}

        <button className="primary-button" type="submit">{isRegister ? 'Daftar' : 'Masuk'}</button>

        <p>
          {isRegister ? 'Sudah punya akun?' : 'Belum memiliki akun?'}
          <button className="inline-button" type="button" onClick={() => onNavigate(isRegister ? 'login' : 'register')}>
            {isRegister ? ' Masuk' : ' Daftar'}
          </button>
        </p>
      </form>
    </section>
  );
}

function DashboardPage({ quizzes, activePanel, setActivePanel, onCreate, onEdit }) {
  const [keyword, setKeyword] = useState('');

  const totalQuestions = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
  const finishedReports = quizzes.filter((quiz) => quiz.questions.length > 0).length;
  const filteredQuizzes = quizzes.filter((quiz) => quiz.title.toLowerCase().includes(keyword.toLowerCase()));

  const groupedReports = useMemo(() => {
    return quizzes.reduce((result, quiz) => {
      result[quiz.category] = (result[quiz.category] || 0) + quiz.questions.length;
      return result;
    }, {});
  }, [quizzes]);

  return (
    <section className="page dashboard-page">
      <header className="dashboard-header">
        <Brand />
        <div className="dashboard-actions">
          <button className="create-button" type="button" onClick={onCreate}>Buat Kuis</button>
          <FaUserCircle className="profile-icon" aria-label="Profil pengajar" />
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <button className={activePanel === 'beranda' ? 'active' : ''} type="button" onClick={() => setActivePanel('beranda')}><FaHome /> Beranda</button>
          <button className={activePanel === 'pustaka' ? 'active' : ''} type="button" onClick={() => setActivePanel('pustaka')}><FaList /> Pustaka</button>
          <button className={activePanel === 'laporan' ? 'active' : ''} type="button" onClick={() => setActivePanel('laporan')}><FaChartLine /> Laporan</button>
        </aside>

        <main className="dashboard-content">
          {activePanel === 'beranda' && (
            <>
              <div className="stat-grid">
                <article><h2>Total soal</h2><FaFileAlt className="stat-icon" /><strong>{totalQuestions || 5} Soal</strong></article>
                <article><h2>Dibuat Hari Ini</h2><FaPencilAlt className="stat-icon" /><strong>{finishedReports || 1} Soal</strong></article>
                <article><h2>Laporan Selesai</h2><FaChartBar className="stat-icon" /><strong>{finishedReports || 1} Laporan</strong></article>
              </div>
              <article className="activity-card">
                <h2>Aktivitas Terbaru</h2>
                <p>Buat soal: {quizzes[0]?.title || 'Soal Quiz 1'}</p>
              </article>
            </>
          )}

          {activePanel === 'pustaka' && (
            <>
              <input className="search-input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari" />
              <div className="quiz-table">
                <div className="quiz-row head"><strong>Judul</strong><strong>Aksi</strong></div>
                {filteredQuizzes.map((quiz) => (
                  <div className="quiz-row" key={quiz.id}>
                    <span>{quiz.title}</span>
                    <button className="dots-button" type="button" onClick={() => onEdit(quiz.id)}><BsThreeDotsVertical /></button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePanel === 'laporan' && (
            <div className="report-grid">
              {Object.entries(groupedReports).map(([category, count]) => (
                <article className="report-card" key={category}>
                  <h3>{category}</h3>
                  <strong>{count ? `${count} Soal Tersedia` : 'Belum Tersedia Soal'}</strong>
                  <button type="button" onClick={() => setActivePanel('pustaka')}>Lihat Selengkapnya</button>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

function CreateQuizModal({ onClose, onSubmit }) {
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [title, setTitle] = useState('');
  const canSubmit = category || newCategory.trim() || title.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      category: newCategory.trim() || category || 'Layanan Web',
    });
  };

  return (
    <div className="modal">
      <form className="modal-card" onSubmit={handleSubmit}>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Pilih Kategori Kuis</option>
          <option>Layanan Web</option>
          <option>Pemrograman Internet</option>
          <option>Sistem Operasi</option>
        </select>
        <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Tambah Kategori" />
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul quiz, contoh: Soal Quiz 1" />
        <button type="submit" disabled={!canSubmit}>Lanjutkan membuat soal</button>
        <button className="modal-close" type="button" onClick={onClose}>Batalkan</button>
      </form>
    </div>
  );
}

function EditorPage({ quiz, onNavigate, onSaveQuestion }) {
  const [title, setTitle] = useState(quiz.title);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState('A');

  const canSave = question.trim() && answers[0].trim() && answers[1].trim();

  const handleAnswer = (index, value) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = value;
    setAnswers(nextAnswers);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSaveQuestion(quiz.id, {
      title,
      question: {
        text: question.trim(),
        answers,
        correct,
      },
    });
    setQuestion('');
    setAnswers(['', '', '', '']);
    setCorrect('A');
  };

  return (
    <section className="page editor-page classroom-page">
      <form className="editor-form" onSubmit={handleSubmit}>
        <header className="editor-header">
          <Brand />
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Masukan Judul disini" />
          <button className="secondary-button" type="button" onClick={() => onNavigate('dashboard')}>Batal</button>
          <button className="save-button" type="submit" disabled={!canSave}>Simpan</button>
        </header>

        <div className="editor-body">
          <aside className="question-sidebar">
            <button className="question-tab" type="button">Soal {quiz.questions.length + 1}</button>
            <button className="add-question-button" type="button"><FaPlus /> Tambahkan</button>
          </aside>

          <section className="question-canvas">
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Mulai tulis soal" required />
            <button className="image-button" type="button"><FaImage /> Tambah Gambar</button>

            <div className="answer-grid">
              {['A', 'B', 'C', 'D'].map((option, index) => (
                <label key={option}>
                  <span><input checked={correct === option} onChange={() => setCorrect(option)} type="radio" name="correct" /> {option}</span>
                  <input value={answers[index]} onChange={(event) => handleAnswer(index, event.target.value)} placeholder="Tambahkan jawaban" required={index < 2} />
                </label>
              ))}
            </div>
          </section>
        </div>
      </form>
    </section>
  );
}

function PlayPage({ quiz, onNavigate }) {
  const fallback = starterQuizzes[0].questions[0];
  const question = quiz?.questions[0] || fallback;

  return (
    <section className="page play-page classroom-page">
      <button className="result-shortcut" type="button" onClick={() => onNavigate('result')}>Lihat Hasil</button>
      <div className="countdown">6</div>
      <article className="play-question">{question.text}</article>
      <div className="play-options">
        {question.answers.map((answer, index) => (
          <button type="button" key={answer}>{['A', 'B', 'C', 'D'][index]}. {answer}</button>
        ))}
      </div>
    </section>
  );
}

function ResultPage({ onNavigate }) {
  return (
    <section className="page result-page classroom-page">
      <button className="back-home" type="button" onClick={() => onNavigate('home')}>Kembali ke beranda</button>
      <div className="score-board">
        <div className="score-bar red"><span>Kejora</span></div>
        <div className="score-bar blue"><span>Wisnu</span></div>
        <div className="score-bar green"><span>Bintang</span></div>
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [quizzes, setQuizzes] = useState(starterQuizzes);
  const [activePanel, setActivePanel] = useState('beranda');
  const [activeQuizId, setActiveQuizId] = useState(starterQuizzes[0].id);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeQuiz = quizzes.find((quiz) => quiz.id === activeQuizId) || quizzes[0];

  const handleCreateQuiz = ({ title, category }) => {
    const quiz = {
      id: `quiz-${Date.now()}`,
      title: title || `Soal Quiz ${quizzes.length + 1}`,
      category,
      questions: [],
    };

    setQuizzes((current) => [quiz, ...current]);
    setActiveQuizId(quiz.id);
    setShowCreateModal(false);
    setPage('editor');
  };

  const handleEditQuiz = (id) => {
    setActiveQuizId(id);
    setPage('editor');
  };

  const handleSaveQuestion = (quizId, payload) => {
    setQuizzes((current) => current.map((quiz) => {
      if (quiz.id !== quizId) {
        return quiz;
      }

      return {
        ...quiz,
        title: payload.title || quiz.title,
        questions: [...quiz.questions, payload.question],
      };
    }));
  };

  return (
    <>
      {page === 'home' && <HomePage onNavigate={setPage} onPlay={() => setPage('play')} />}
      {page === 'login' && <AuthPage mode="login" onNavigate={setPage} />}
      {page === 'register' && <AuthPage mode="register" onNavigate={setPage} />}
      {page === 'dashboard' && (
        <DashboardPage
          quizzes={quizzes}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          onCreate={() => setShowCreateModal(true)}
          onEdit={handleEditQuiz}
        />
      )}
      {page === 'editor' && <EditorPage quiz={activeQuiz} onNavigate={setPage} onSaveQuestion={handleSaveQuestion} />}
      {page === 'play' && <PlayPage quiz={activeQuiz} onNavigate={setPage} />}
      {page === 'result' && <ResultPage onNavigate={setPage} />}
      {showCreateModal && <CreateQuizModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateQuiz} />}
    </>
  );
}
