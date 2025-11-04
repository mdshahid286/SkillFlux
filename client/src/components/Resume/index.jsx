import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { ResumePDF } from './ResumePDF';
import { ResumeControlBar } from './ResumeControlBar';
import { useAppSelector } from '../../redux/hooks';
import { selectResume } from '../../redux/resumeSlice';
import { selectSettings } from '../../redux/settingsSlice';
import ResumeDOM from './ResumeDOM';

export const Resume = () => {
	const [scale, setScale] = useState(1);
	const [viewMode, setViewMode] = useState('fitWidth'); // 'fitWidth' | 'fitPage' | 'manual'
	const wrapperRef = useRef(null);
	const paperRef = useRef(null);

	const resume = useAppSelector(selectResume);
	const settings = useAppSelector(selectSettings);

	const pdfDocument = useMemo(
		() => <ResumePDF resume={resume} settings={settings} isPDF={true} />,
		[resume, settings]
	);

	const recalcScale = (mode = viewMode) => {
		const wrapper = wrapperRef.current;
		const paper = paperRef.current;
		if (!wrapper || !paper) return;
		
		// Wait for next frame to ensure layout is complete
		requestAnimationFrame(() => {
			const wrapperRect = wrapper.getBoundingClientRect();
			if (wrapperRect.width === 0 || wrapperRect.height === 0) return;
			
			// Convert paper dimensions to pixels
			// A4: 210mm = 793.7px at 96 DPI, 8.5in = 816px at 96 DPI
			const isA4 = settings.documentSize === 'A4';
			const paperWidthPx = isA4 ? 793.7 : 816; // Approximate pixel width at 96 DPI
			const paperHeightPx = isA4 ? 1123 : 1056; // Approximate pixel height at 96 DPI
			
			const PAD = 48; // px padding around (24px on each side)
			if (mode === 'fitWidth') {
				// Use the wrapper's actual width minus padding
				const availableWidth = wrapperRect.width - PAD;
				const fitWidthScale = availableWidth / paperWidthPx;
				setScale(Math.max(0.5, Math.min(1.5, fitWidthScale)));
				setViewMode('fitWidth');
			} else if (mode === 'fitPage') {
				const availableWidth = wrapperRect.width - PAD;
				const availableHeight = wrapperRect.height - PAD;
				const fitW = availableWidth / paperWidthPx;
				const fitH = availableHeight / paperHeightPx;
				const fitPageScale = Math.max(0.5, Math.min(1.5, Math.min(fitW, fitH)));
				setScale(fitPageScale);
				setViewMode('fitPage');
			}
		});
	};

	useLayoutEffect(() => {
		const onResize = () => recalcScale();
		recalcScale('fitWidth');
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleFitWidth = () => recalcScale('fitWidth');
	const handleFitPage = () => recalcScale('fitPage');
	const handleReset = () => {
		setViewMode('manual');
		setScale(1);
	};

	const paperWidth = settings.documentSize === 'A4' ? '210mm' : '8.5in';
	const paperMinHeight = settings.documentSize === 'A4' ? '297mm' : '11in';

	return (
		<div className="relative flex h-full flex-col" style={{ overflow: 'hidden' }}>
			<div
				ref={wrapperRef}
				className="flex-1 bg-gray-50 resume-preview-wrapper"
				style={{ 
					display: 'flex', 
					justifyContent: 'center', 
					alignItems: 'flex-start', 
					padding: 24,
					overflowY: 'auto',
					overflowX: 'hidden'
				}}
			>
				<div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
					<div
						ref={paperRef}
						style={{
							width: paperWidth,
							minHeight: paperMinHeight,
							backgroundColor: 'white',
							boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
							border: '1px solid #e5e7eb',
							borderRadius: 8
						}}
					>
						<ResumeDOM resume={resume} settings={settings} />
					</div>
				</div>
			</div>
			<ResumeControlBar
				scale={scale}
				setScale={(s) => {
					setViewMode('manual');
					setScale(s);
				}}
				pdfDocument={pdfDocument}
				fileName={`${resume.profile.name || 'Resume'}.pdf`}
				onFitWidth={handleFitWidth}
				onFitPage={handleFitPage}
				onReset={handleReset}
			/>
		</div>
	);
};

