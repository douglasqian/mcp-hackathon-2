"use client"

import type React from "react"

import { useState, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Send, RotateCcw } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the STLViewer component to avoid SSR issues
const STLViewer = dynamic(() => import("@/components/stl-viewer"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading 3D viewer...</div>,
})

export default function Home() {
  const [stlFile, setStlFile] = useState<File | null>(null)
  const [stlUrl, setStlUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setStlFile(file)

      // Create a URL for the file
      const url = URL.createObjectURL(file)
      setStlUrl(url)
    }
  }

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Reset the viewer
  const handleReset = () => {
    setStlFile(null)
    setStlUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Custom submit handler to scroll to bottom after sending message
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e)

    // Scroll to bottom after a short delay to ensure new message is rendered
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    }, 100)
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* STL Viewer Section */}
      <div className="w-full md:w-1/2 h-1/2 md:h-screen p-4 border-r border-border">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>3D STL Viewer</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload STL
                </Button>
                {stlFile && (
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".stl" className="hidden" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0 relative">
            {stlUrl ? (
              <Canvas className="h-full">
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <Suspense fallback={null}>
                  <STLViewer url={stlUrl} />
                </Suspense>
                <OrbitControls />
              </Canvas>
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No STL file loaded</p>
                  <Button onClick={handleUploadClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload STL File
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          {stlFile && (
            <CardFooter className="pt-2 pb-4">
              <p className="text-sm text-muted-foreground">
                Loaded: {stlFile.name} ({(stlFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* AI Chat Section */}
      <div className="w-full md:w-1/2 h-1/2 md:h-screen p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>AI Assistant</CardTitle>
          </CardHeader>
          <CardContent ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p className="mb-2">Ask me about your 3D model</p>
                  <p className="text-sm">
                    I can help with STL file analysis, 3D printing advice, and model optimization
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <form onSubmit={onSubmit} className="w-full flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your 3D model..."
                className="flex-grow"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
