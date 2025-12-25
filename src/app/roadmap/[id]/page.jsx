import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/app/auth";
import Roadmap from "@/components/Home/RoadMap";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

//function to fetch roadmap
async function getRoadmap(id) {
    const session = await auth();
    if (session) {
        const docRef = doc(db, "users", session.user.email, "roadmaps", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists) {
            return false;
        }
        
        return docSnap.data();
    }
}

//roadmap component
const page = async ({ params }) => {
    const { id } = await params;
    const roadmap = await getRoadmap(id);

    if (!roadmap) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                {" "}
                <p className="text-lg font-semibold">Roadmap doesn't exist</p>
            </div>
        );
    }

    return (
        <div className="w-screen">
            <div className="mx-auto max-w-2xl p-4">
                <Breadcrumb className="my-2">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/roadmap">
                                Roadmap
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                {roadmap.courseTitle}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Roadmap roadMap={roadmap} id={id}></Roadmap>
            </div>
        </div>
    );
};

export default page;
