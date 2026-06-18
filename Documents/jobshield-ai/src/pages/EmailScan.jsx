export default function EmailScan() {
  return (
    <div className='min-h-screen'>
      <nav className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <a href='/' className='text-2xl font-bold text-primary'>JobShield AI</a>
          </div>
        </div>
      </nav>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-4xl font-bold text-text-primary mb-4'>Email Forward Analyzer</h1>
        <p className='text-xl text-text-secondary mb-8'>Forward job emails to analyze@jobshield.ai for instant analysis</p>
        <div className='card'><p className='text-text-secondary'>Setup instructions coming soon</p></div>
      </div>
    </div>
  );
}
