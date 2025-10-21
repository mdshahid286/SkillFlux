import React, { useMemo } from 'react';

export default function ResumeDOM({ resume, settings }) {
	const { profile, workExperiences, educations, projects, skills } = resume;
	const {
		fontFamily = 'Helvetica',
		fontSize = '11',
		formToHeading,
		formToShow,
		formsOrder,
		showBulletPoints,
	} = settings;
	const themeColor = settings.themeColor || '#111827';

	const baseFontPx = useMemo(() => {
		const pt = parseInt(fontSize) || 11;
		return Math.round(pt * 1.333);
	}, [fontSize]);

	const hRule = { borderBottom: '1px solid #e5e7eb' };
	const sky = '#38bdf8';
	const headingStyle = {
		fontSize: baseFontPx - 1,
		fontWeight: 800,
		color: sky,
		margin: '0 0 8px 0',
		paddingBottom: 4,
		...hRule,
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
	};
	const sectionGap = 18;
	const sectionWrapperStyle = { marginTop: sectionGap };
	const line = { display: 'flex', gap: 10, alignItems: 'flex-start', color: '#111827' };
	const muted = { color: '#64748b' };

	const FieldBold = ({ children }) => (
		<span style={{ fontWeight: 700, color: '#111827' }}>{children}</span>
	);

	const Section = ({ title, children }) => (
		<div style={sectionWrapperStyle}>
			<div style={headingStyle}>{title}</div>
			<div>{children}</div>
		</div>
	);

	return (
		<div style={{ fontFamily, fontSize: baseFontPx, lineHeight: 1.5, color: '#111827', padding: '0.55in' }}>
			{Boolean(settings.themeColor) && (
				<div style={{ height: 6, width: 'calc(100% + 1.1in)', background: themeColor, margin: '-0.55in 0 14px -0.55in' }} />
			)}

			{/* Profile Header */}
			<div style={{ textAlign: 'center', marginBottom: 8 }}>
				<div style={{ fontWeight: 900, fontSize: baseFontPx + 8, letterSpacing: '0.01em', color: '#111827', marginBottom: 2 }}>
					{profile.name || 'Your Name'}
				</div>
				<div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 2, ...muted }}>
					{profile.email && <span>{profile.email}</span>}
					{profile.phone && <span>{profile.phone}</span>}
					{profile.url && <span>{profile.url}</span>}
					{profile.location && <span>{profile.location}</span>}
				</div>
				{profile.summary && (
					<div style={{ marginTop: 10, paddingTop: 10, ...hRule, textAlign: 'justify', color: '#111827' }}>
						{profile.summary}
					</div>
				)}
			</div>

			{/* Ordered sections */}
			{formsOrder.filter((form) => formToShow[form]).map((form) => {
				if (form === 'workExperiences') {
					return (
						<Section key={form} title={formToHeading['workExperiences'] || 'WORK EXPERIENCE'}>
							{workExperiences.map(({ company, jobTitle, date, descriptions = [] }, idx) => (
								<div key={idx} style={{ marginBottom: 10 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
										<div style={{ fontWeight: 800, color: '#111827' }}>{company}</div>
										{date && <div style={{ ...muted, fontWeight: 700 }}>{date}</div>}
									</div>
									{jobTitle && (
										<div style={{ color: themeColor, fontWeight: 800, marginTop: 1 }}><FieldBold>{jobTitle}</FieldBold></div>
									)}
									{descriptions.length > 0 && (
										<div style={{ marginTop: 5 }}>
											{descriptions.map((d, i) => (
												<div key={i} style={line}>
													{showBulletPoints['workExperiences'] !== false && <span>•</span>}
													<div style={{ flex: 1 }}>{d}</div>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</Section>
					);
				}
				if (form === 'educations') {
					return (
						<Section key={form} title={formToHeading['educations'] || 'EDUCATION'}>
							{educations.map(({ school, degree, date, gpa, descriptions = [] }, idx) => (
								<div key={idx} style={{ marginBottom: 10 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
										<div style={{ fontWeight: 800, color: '#111827' }}>{school}</div>
										{date && <div style={{ ...muted, fontWeight: 700 }}>{date}</div>}
									</div>
									{degree && (
										<div style={{ color: themeColor, fontWeight: 800, marginTop: 1 }}>
											<FieldBold>{gpa ? `${degree} - GPA: ${gpa}` : degree}</FieldBold>
										</div>
									)}
									{descriptions.length > 0 && (
										<div style={{ marginTop: 5 }}>
											{descriptions.map((d, i) => (
												<div key={i} style={line}>
													{showBulletPoints['educations'] !== false && <span>•</span>}
													<div style={{ flex: 1 }}>{d}</div>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</Section>
					);
				}
				if (form === 'projects') {
					return (
						<Section key={form} title={formToHeading['projects'] || 'PROJECTS'}>
							{projects.map(({ project, date, descriptions = [] }, idx) => (
								<div key={idx} style={{ marginBottom: 10 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
										<div style={{ fontWeight: 800, color: themeColor }}><FieldBold>{project}</FieldBold></div>
										{date && <div style={{ ...muted, fontWeight: 700 }}>{date}</div>}
									</div>
									{descriptions.length > 0 && (
										<div style={{ marginTop: 5 }}>
											{descriptions.map((d, i) => (
												<div key={i} style={line}>
													<span>•</span>
													<div style={{ flex: 1 }}>{d}</div>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</Section>
					);
				}
				if (form === 'skills') {
					const { featuredSkills = [], descriptions = [] } = skills;
					const hasFeatured = featuredSkills.some((s) => s.skill);
					return (
						<Section key={form} title={formToHeading['skills'] || 'SKILLS'}>
							{hasFeatured && (
								<div>
									{featuredSkills.map(({ skill, rating }, idx) => (
										<div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
											<div style={{ fontWeight: 800, color: '#111827', flex: 1 }}>{skill}</div>
											<div style={{ display: 'flex', gap: 6 }}>
												{[1, 2, 3].map((level) => (
													<div key={level} style={{ width: 8, height: 8, borderRadius: 4, background: rating >= level ? themeColor : '#d1d5db' }} />
												))}
											</div>
										</div>
									))}
								</div>
							)}
							{descriptions.length > 0 && (
								<div style={{ marginTop: hasFeatured ? 6 : 0 }}>
									{descriptions.map((d, i) => (
										<div key={i} style={line}>
											{showBulletPoints['skills'] !== false && <span>•</span>}
											<div style={{ flex: 1 }}>{d}</div>
										</div>
									))}
								</div>
							)}
						</Section>
					);
				}
				return null;
			})}
		</div>
	);
}
