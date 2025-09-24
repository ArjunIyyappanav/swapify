import { React, useState } from 'react';
import axios from '../utils/api';
import {useParams} from 'react-router-dom';
import { Send, CheckCircle, XCircle } from 'lucide-react';

const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Toast = ({ message, type, onDismiss }) => {
    useState(() => {
        const timer = setTimeout(() => onDismiss(), 4000);
        return () => clearTimeout(timer);
    });

    const styles = {
        success: "bg-green-600",
        error: "bg-red-600",
    };
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-[100] animate-fade-in-up ${styles[type]}`}>
            <Icon className="w-6 h-6 mr-3" />
            {message}
        </div>
    );
};


const CreateTeam = () => {
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const {name} = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        if (!description.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post("/team/create",{"toUsername":name,"description":description,"status":"pending"});
            if(!response) console.log("Error in creating a team request");
            console.log("Team request sent with description:", description);
            setNotification({ show: true, message: "Team request created successfully!", type: "success" });
            setDescription(''); 
        } catch (err) {
            console.error("An error occurred during Team request : ", err);
            setNotification({ show: true, message: "Could not send team request.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {notification.show && (
                <Toast 
                    message={notification.message} 
                    type={notification.type} 
                    onDismiss={() => setNotification({ show: false, message: '', type: '' })} 
                />
            )}
            <div className="max-w-2xl mx-auto p-4 md:p-8 text-neutral-200 font-sans">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Create a New Team</h1>
                    <p className="text-neutral-400 mt-2">Find collaborators for your next hackathon or project.</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
                                    Project or Hackathon Description
                                </label>
                                <textarea
                                    id="description"
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                    placeholder="Describe the project, competition, or hackathon you're building a team for..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !description.trim()}
                                className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Spinner /> : <Send className="w-5 h-5 mr-2" />}
                                Send Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateTeam;
