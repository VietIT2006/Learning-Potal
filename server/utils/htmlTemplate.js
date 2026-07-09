export const renderApprovalPage = (status, message) => {
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const isWarning = status === 'warning';

  let icon = '';
  let colorClass = '';
  let bgColorClass = '';
  let title = '';

  if (isSuccess) {
    icon = `<svg class="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    colorClass = 'text-emerald-600';
    bgColorClass = 'bg-emerald-50';
    title = 'Thành công!';
  } else if (isError) {
    icon = `<svg class="w-16 h-16 text-rose-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    colorClass = 'text-rose-600';
    bgColorClass = 'bg-rose-50';
    title = 'Từ chối đăng nhập';
  } else {
    icon = `<svg class="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    colorClass = 'text-amber-600';
    bgColorClass = 'bg-amber-50';
    title = 'Yêu cầu không hợp lệ';
  }

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác nhận đăng nhập - LearnHub</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
      </style>
    </head>
    <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4" style="background-image: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);">
      
      <div class="glass-card max-w-md w-full rounded-2xl p-8 text-center relative overflow-hidden">
        <!-- Decorative background circle -->
        <div class="absolute -top-24 -right-24 w-48 h-48 rounded-full ${bgColorClass} opacity-50 blur-2xl"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 rounded-full ${bgColorClass} opacity-50 blur-2xl"></div>
        
        <div class="relative z-10">
          <!-- Logo -->
          <div class="mb-8 flex justify-center items-center gap-2">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <span class="text-2xl font-bold text-slate-800 tracking-tight">LearnHub</span>
          </div>

          <!-- Status Icon -->
          ${icon}

          <!-- Message -->
          <h1 class="text-2xl font-bold text-slate-800 mb-2">${title}</h1>
          <p class="text-slate-600 text-lg mb-8 leading-relaxed">${message}</p>

          <!-- Button -->
          <button onclick="window.close()" class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200">
            Đóng cửa sổ này
          </button>
        </div>
      </div>

    </body>
    </html>
  `;
};
