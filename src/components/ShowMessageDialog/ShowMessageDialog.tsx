import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";

type ShowMessageDialogProps = {
	open: boolean;
	handleClose: () => void;
	handleConfirm: () => void;
	message: string;
	title: string;
};

const ShowMessageDialog = (props: ShowMessageDialogProps) => {
	const { open, handleClose, handleConfirm, message, title } = props;

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{message}</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} color="primary">
					Cancel
				</Button>
				<Button onClick={handleConfirm} color="primary" autoFocus>
					OK
				</Button>
			</DialogActions>
		</Dialog>
	);
};

// Example
// ShowMessageDialog({
//     open: true,
//     handleClose: () => { },
//     handleConfirm: () => { },
//     message: 'The file does not look like a valid save file.\nPlease check the data format',
//     title: 'Invalid file'
//   })
export default ShowMessageDialog;
