import Header from "@/app/components/header";
import ChatSection from "./components/chat-section";

export default function Home() {
  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="lg:space-y-5 w-[90%] lg:w-[60rem] h-[85%] flex">
          <ChatSection />
      </div>
    </main>
  );
}
