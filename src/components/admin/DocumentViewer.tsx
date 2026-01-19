import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, File, Image as ImageIcon } from 'lucide-react';

interface DocumentViewerProps {
    documents: Record<string, string> | null | undefined;
    title?: string;
}

/**
 * Component to display uploaded documents in admin panel
 * Documents are stored as { fileName: fileUrl } in Firestore
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({
    documents,
    title = "Hati Zilizopakiwa"
}) => {
    if (!documents || Object.keys(documents).length === 0) {
        return (
            <Card className="mt-4">
                <CardContent className="py-6 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Hakuna hati zilizopakiwa</p>
                    <p className="text-sm">No documents uploaded</p>
                </CardContent>
            </Card>
        );
    }

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <ImageIcon className="w-5 h-5 text-blue-500" />;
        }
        if (['pdf'].includes(ext || '')) {
            return <FileText className="w-5 h-5 text-red-500" />;
        }
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const getFileType = (fileName: string): string => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return 'Image';
        }
        if (['pdf'].includes(ext || '')) {
            return 'PDF';
        }
        if (['doc', 'docx'].includes(ext || '')) {
            return 'Word';
        }
        return 'Document';
    };

    const isImage = (fileName: string): boolean => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    };

    const documentList = Object.entries(documents);

    return (
        <Card className="mt-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {title}
                    <Badge variant="secondary" className="ml-2">
                        {documentList.length} {documentList.length === 1 ? 'file' : 'files'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {documentList.map(([fileName, fileUrl], index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {getFileIcon(fileName)}
                                <div>
                                    <p className="font-medium text-sm truncate max-w-[200px]" title={fileName}>
                                        {fileName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {getFileType(fileName)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* View Button - opens in new tab */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(fileUrl, '_blank')}
                                    title="View document"
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>

                                {/* Download Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    title="Download document"
                                >
                                    <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Image Previews */}
                {documentList.some(([fileName]) => isImage(fileName)) && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Picha za Haraka / Image Previews</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {documentList
                                .filter(([fileName]) => isImage(fileName))
                                .map(([fileName, fileUrl], index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => window.open(fileUrl, '_blank')}
                                    >
                                        <img
                                            src={fileUrl}
                                            alt={fileName}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DocumentViewer;
