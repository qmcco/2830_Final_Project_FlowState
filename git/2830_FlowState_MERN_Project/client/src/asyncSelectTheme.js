export const asyncSelectStyles = {
	control: (base) => ({
		...base,
		minHeight: '38px',
		marginBottom: '10px',
		backgroundColor: '#2e303a',
		color: 'white',
	}),
	menu: (base) => ({
		...base,
		backgroundColor: '#2e303a',
		border: '1px solid #2e303a',
	}),
	menuList: (base) => ({
		...base,
		backgroundColor: '#2e303a',
	}),
	option: (base, state) => ({
		...base,
		backgroundColor: state.isFocused ? '#3d414a' : '#2e303a',
		color: 'white',
		cursor: 'pointer',
	}),
	multiValue: (base) => ({
		...base,
		backgroundColor: 'plum',
	}),
	multiValueLabel: (base) => ({
		...base,
		color: '#1d202b',
		fontWeight: 500,
	}),
};
