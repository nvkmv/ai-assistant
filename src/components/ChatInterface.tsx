'use client';


// Импортируем хуки React для управления состоянием и DOM
import { useState, useRef, useEffect } from 'react';
// Импортируем ReactMarkdown для отображения текста в формате Markdown
import ReactMarkdown from 'react-markdown';
// Добавляем поддержку таблиц и других элементов GitHub Flavored Markdown
import remarkGfm from 'remark-gfm';


// Определяем интерфейс для сообщений, чтобы TypeScript проверял их структуру
interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'image';
    model?: string;
}


// Список доступных моделей ИИ с описаниями для выбора пользователем
const AVAILABLE_MODELS = [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Идеально для большинства задач' },
    { id: 'o3', name: 'o3', description: 'Продвинутое логическое мышление' },
    { id: 'o4-mini', name: 'o4-mini', description: 'Быстрое решение сложных задач' },
    { id: 'o4-mini-high', name: 'o4-mini-high', description: 'Отлично для кода и визуального анализа' },
];


// Основной компонент чата
export default function ChatInterface() {
    // Состояния для управления чатом: история сообщений, ввод текста, загрузка и т.д.
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'chat' | 'image'>('chat');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    // Референсы для управления DOM: прокрутка и высота текстового поля
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    // Функция для прокрутки к последнему сообщению
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };


    // Эффект для автоматической прокрутки при обновлении сообщений
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    // Эффект для динамической высоты текстового поля при вводе
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);


    // Обработчик отправки формы (отправка сообщения)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;


        const userMessage: Message = {
            role: 'user',
            content: input,
            model: selectedModel,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);


        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    mode: mode,
                    model: selectedModel,
                }),
            });


            const data = await response.json();
            setMessages((prev) => [...prev, { ...data, model: selectedModel }]);
        } catch (error) {
            console.error('Ошибка:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Извините, что-то пошло не так. Попробуйте снова!',
                    model: selectedModel,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };


    // Обработчик нажатия Enter для отправки сообщения
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any); // Приведение типа для совместимости (можно улучшить с типами)
        }
    };


    // Функция для очистки истории чата
    const clearConversation = () => {
        setMessages([]);
    };


    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Заголовок с выбором модели и кнопкой очистки */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold">Ваш AI-ассистент</h1>
                        <div className="relative">
                            <button
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <span>{AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>


                            {showModelDropdown && (
                                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-500">Выбор модели</div>
                                    {AVAILABLE_MODELS.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel(model.id);
                                                setShowModelDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group ${selectedModel === model.id ? 'bg-gray-50' : ''
                                                }`}
                                        >
                                            <div>
                                                <div className="font-medium text-sm">{model.name}</div>
                                                <div className="text-xs text-gray-500">{model.description}</div>
                                            </div>
                                            {selectedModel === model.id && (
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


                    <button
                        onClick={clearConversation}
                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        title="Очистить чат"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>


            {/* Область отображения сообщений с поддержкой прокрутки */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto">
                    {messages.length === 0 && (
                        <div className="text-center py-16">
                            <h2 className="text-2xl font-semibold text-gray-900">Задайте мне вопрос или опишите изображение!</h2>
                        </div>
                    )}


                    {messages.map((message, index) => (
                        <div key={index} className="py-4">
                            <div className="flex gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-800 text-white'
                                        }`}
                                >
                                    {message.role === 'user' ? (
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">
                                        {message.role === 'user' ? 'Вы' : 'Ассистент'}
                                    </div>
                                    {message.type === 'image' ? (
                                        <img
                                            src={message.content}
                                            alt="Сгенерированное изображение"
                                            className="max-w-full rounded-lg mt-2"
                                        />
                                    ) : (
                                        <div className="text-gray-800 mt-1">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}


                    {isLoading && (
                        <div className="py-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        <div
                                            className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"
                                            style={{ animationDelay: '0.2s' }}
                                        />
                                        <div
                                            className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"
                                            style={{ animationDelay: '0.4s' }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">Ассистент</div>
                                    <div className="text-gray-600 text-sm mt-1">Обрабатываю запрос...</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>


            {/* Поле ввода с переключением режимов */}
            <div className="bg-white border-t p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setMode('chat')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Текст
                        </button>
                        <button
                            onClick={() => setMode('image')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Изображение
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={mode === 'chat' ? 'Введите ваш вопрос...' : 'Опишите желаемое изображение...'}
                            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={1}
                            style={{ maxHeight: '150px' }}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`absolute right-2 bottom-2 p-2 rounded-lg ${isLoading || !input.trim() ? 'text-gray-400 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        {mode === 'chat' ? 'Ответы могут содержать неточности, проверяйте важные данные.' : 'Изображения могут отличаться от описания.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
