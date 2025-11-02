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
		const wrapperRect = wrapper.getBoundingClientRect();
		const paperRect = paper.getBoundingClientRect();
		if (paperRect.width === 0 || paperRect.height === 0) return;
		const PAD = 24; // px padding around
		if (mode === 'fitWidth') {
			const unscaledWidth = paperRect.width / scale;
			const fitWidthScale = (wrapperRect.width - PAD * 2) / unscaledWidth;
			setScale(Math.max(0.5, Math.min(1.5, fitWidthScale)));
			setViewMode('fitWidth');
		} else if (mode === 'fitPage') {
			const unscaledWidth = paperRect.width / scale;
			const unscaledHeight = paperRect.height / scale;
			const fitW = (wrapperRect.width - PAD * 2) / unscaledWidth;
			const fitH = (wrapperRect.height - PAD * 2) / unscaledHeight;
			const fitPageScale = Math.max(0.5, Math.min(1.5, Math.min(fitW, fitH)));
			setScale(fitPageScale);
			setViewMode('fitPage');
		}
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
		<div className="relative flex h-full flex-col">
			<div
				ref={wrapperRef}
				className="flex-1 overflow-auto bg-gray-50"
				style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 24 }}
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

